import { Client } from "@elastic/elasticsearch";
import { Context, ContextReply } from "@sdkgen/node-runtime";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { randomBytes } from "crypto";
import { env } from "./env";

type AxiosRequestConfigWithTime = AxiosRequestConfig & { startTime: number };

let elasticsearch: Client | undefined;

function formatIndexName(index: string, date = new Date()) {
  return [
    process.env.ENVIRONMENT,
    index,
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("_");
}

export function startElasticsearch() {
  if (process.env.ELASTICSEARCH_URL) {
    elasticsearch = new Client({ node: env.ELASTICSEARCH_URL });
  }
}

export function configureIndex(index: string) {
  setTimeout(() => configureIndex(index), 3600 * 1000);

  if (!elasticsearch) {
    return;
  }

  elasticsearch.indices.create({ index: formatIndexName(index) }).catch(console.error);

  elasticsearch.indices
    .putSettings({
      body: {
        "index.blocks.read_only_allow_delete": null,
        "index.mapping.total_fields.limit": 100000,
        "index.max_docvalue_fields_search": 200,
      },
      index: formatIndexName(index),
    })
    .catch(console.error);
}

export async function insertOnElasticsearch(index: string, data: { id: string; date: Date; [k: string]: unknown }) {
  if (!elasticsearch) {
    return;
  }

  await elasticsearch.index({
    body: data,
    id: data.id,
    index: formatIndexName(index),
    type: "entry",
  });
}

export async function insertSdkgenReplyOnElasticsearch(ctx: Context, reply: ContextReply) {
  if (!elasticsearch) {
    return;
  }

  let lastError;

  /**
   * O Elasticsearch não permite que um mapping mude de tipo. Portanto se houver uma mudança no contrato do sdkgen
   * ou se for utilizado um tipo json ou similar que seja mutável, o nome do campo será incrementado até um novo
   * que funcione. Como todo dia um novo índice é criado, esse contador vai voltar a 1 no dia seguinte.
   */
  for (let i = 1; i < 50; ++i) {
    try {
      await insertOnElasticsearch("api_calls", {
        date: new Date(),
        deviceInfo: ctx.request.deviceInfo,
        error: reply.error,
        extra: ctx.request.extra,
        headers: ctx.request.headers,
        id: ctx.request.id,
        name: ctx.request.name,
        version: ctx.request.version,
        [`${ctx.request.name}Args${i === 1 ? "" : i}`]: ctx.request.args,
        [`${ctx.request.name}Result${i === 1 ? "" : i}`]: reply.result,
      });

      return;
    } catch (error) {
      lastError = error;
    }
  }

  console.error(lastError);
}

export function attachLogInterceptorToAxiosInstance(axiosInstance: AxiosInstance) {
  function insertLog(request: AxiosRequestConfig, response: AxiosResponse) {
    const durationMs = Date.now() - (request as AxiosRequestConfigWithTime).startTime;

    insertOnElasticsearch("request_logs", {
      date: new Date(),
      durationMs,
      id: request.headers["x-tracking-request-id"],
      request: {
        body: typeof request.data === "string" ? request.data : JSON.stringify(request.data),
        headers: request.headers,
        params: request.params,
        query: request.method,
        url: request.url,
      },
      response: {
        body: typeof response.data === "string" ? response.data : JSON.stringify(response.data),
        headers: response.headers,
        status: response.status,
      },
    }).catch(err => {
      console.error(`Failed to save request ${request.headers["x-tracking-request-id"]} in Elasticsearch`, err);
    });
  }

  axiosInstance.interceptors.request.use(
    request => {
      (request as AxiosRequestConfigWithTime).startTime = Date.now();
      request.headers["x-tracking-request-id"] = randomBytes(16).toString("hex");
      return request;
    },
    error => {
      throw error;
    },
  );

  axiosInstance.interceptors.response.use(
    response => {
      insertLog(response.config, response);
      return response;
    },
    error => {
      if (error.response) {
        insertLog(error.response.config, error.response);
      }

      throw error;
    },
  );

  return axiosInstance;
}
