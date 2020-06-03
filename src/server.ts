import { SdkgenHttpServer } from "@sdkgen/node-runtime";
import { captureException, withScope } from "@sentry/core";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { api } from "./api";
import "./controllers";
import { Fatal } from "./generated/api";
import { insertSdkgenReplyOnElasticsearch, startElasticsearch } from "./helpers/elasticsearch";
import { startSentry } from "./helpers/sentry";
import { trFactory } from "./helpers/translate";
import { createTvmazeAxiosClient } from "./integrations/tvmaze";
import { ObjectiveRepository, UserRepository } from "./repositories";

process.env.TZ = "UTC";

api.hook.onRequestStart = async ctx => {
  ctx.tr = trFactory(ctx.request.deviceInfo.language ?? "pt");
  ctx.captureException = err => {
    withScope(scope => {
      const { name, deviceInfo, args } = ctx.request;
      const transactionId = ctx.request.id.substring(0, 32);

      scope.setExtra("request", ctx.request);
      scope.setTag("transaction_id", transactionId);
      scope.setTag("call", name);
      scope.setContext(name, {
        args,
        call: name,
        deviceInfo,
      });

      captureException(err);
    });
  };

  return Promise.resolve(null);
};

api.hook.onRequestEnd = async (ctx, reply) => {
  insertSdkgenReplyOnElasticsearch(ctx, reply).catch(err => {
    console.error(`Failed to save request in Elasticsearch`, err);
  });

  if (reply.error && (!reply.error.type || reply.error.type === "Fatal")) {
    ctx.captureException(reply.error);
    console.error(reply.error);
    reply.error = new Fatal(ctx.tr`Erro interno`);
  }

  return Promise.resolve(reply);
};

getConnectionOptions()
  .then(async options => {
    return createConnection({
      ...options,
      migrationsRun: true,
    });
  })
  .then(connection => {
    startSentry();
    startElasticsearch();

    const server = new SdkgenHttpServer(api, {
      captureException,
      db: {
        connection,
        objective: connection.getCustomRepository(ObjectiveRepository),
        user: connection.getCustomRepository(UserRepository),
      },
      integrations: {
        tvmaze: createTvmazeAxiosClient(),
      },
      tr: trFactory("pt"),
    });

    server.listen(parseInt(process.env.PORT ?? "8000", 10));
  })
  .catch(error => console.error(error));
