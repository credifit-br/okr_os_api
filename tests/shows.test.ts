import { apiTestWrapper } from "@sdkgen/node-runtime";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { readFileSync } from "fs";
import { join } from "path";
import { api, Context } from "../src/api";
import "../src/controllers";
import { createTvmazeAxiosClient } from "../src/integrations/tvmaze";
import { makeCtx } from "./helpers";

const { fn } = apiTestWrapper(api);

describe("Shows", () => {
  let ctx: Context;

  beforeAll(() => {
    ctx = makeCtx({
      integrations: {
        tvmaze: axios.create(),
      },
    });

    const mock = new MockAdapter(ctx.integrations.tvmaze);

    mock
      .onGet("/shows/0/episodes")
      .reply(404, JSON.parse(readFileSync(join(__dirname, "__mock__", "shows", "0.json"), "utf8")));

    mock
      .onGet("/shows/1/episodes")
      .reply(200, JSON.parse(readFileSync(join(__dirname, "__mock__", "shows", "1.json"), "utf8")));

    mock
      .onGet("/shows/2/episodes")
      .reply(200, JSON.parse(readFileSync(join(__dirname, "__mock__", "shows", "2.json"), "utf8")));
  });

  test("created client should point to TVmaze API", () => {
    expect(createTvmazeAxiosClient().defaults.baseURL).toBe("https://api.tvmaze.com/");
  });

  test("should return 404 if show doesn't exist", async () => {
    try {
      await fn.getEpisodes(ctx, { showId: 0 });
    } catch (error) {
      expect(error.message).toMatch("Erro ao consultar episódios no TVmaze");
    }
  });

  function testShowFn(showId: number, length: number) {
    return async () => {
      const episodes = await fn.getEpisodes(ctx, { showId });

      expect(episodes).toHaveLength(length);
    };
  }

  test("should return all episodes of a show", testShowFn(1, 39));
  test("should return all episodes of another show", testShowFn(2, 103));
});
