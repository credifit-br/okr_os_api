import { Context as SdkgenContext } from "@sdkgen/node-runtime";
import { AxiosInstance } from "axios";
import { Connection } from "typeorm";
import { ApiConfig } from "./generated/api";
import { ObjectiveRepository, UserRepository } from "./repositories";

interface ExtraContext {
  tr(str: TemplateStringsArray, ...args: unknown[]): string;
  captureException(error: Error): void;
  db: {
    connection: Connection;
    user: UserRepository;
    objective: ObjectiveRepository;
  };
  integrations: {
    tvmaze: AxiosInstance;
  };
}

export type Context = SdkgenContext & ExtraContext;

export const api = new ApiConfig<Context>();
