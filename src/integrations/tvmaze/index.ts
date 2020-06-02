import axios from "axios";
import { Context } from "../../api";
import { attachLogInterceptorToAxiosInstance } from "../../helpers/elasticsearch";
import { createValidator } from "../../helpers/schema-validator";

export function createTvmazeAxiosClient() {
  return attachLogInterceptorToAxiosInstance(
    axios.create({
      baseURL: "https://api.tvmaze.com/",
    }),
  );
}

const validateEpisodeList = createValidator("EpisodeList");

export type EpisodeList = Episode[];

export interface Episode {
  /**
   * @type integer
   */
  id: number;

  /**
   * @format uri
   */
  url: string;
  name: string;
  season: number;
  number: number;

  /**
   * Formato: 2018-12-30
   * @format date
   */
  airdate: string;

  /**
   * Formato: 22:00
   * @format HH:MM
   */
  airtime: string;

  /**
   * Formato: 2013-07-02T02:00:00+00:00
   */
  airstamp: Date;
  runtime: number;
  image: {
    /**
     * @format uri
     */
    medium: string;

    /**
     * @format uri
     */
    original: string;
  };
  summary: string;
  _links: {
    self: {
      /**
       * @format uri
       */
      href: string;
    };
  };
}

export async function getEpisodes(ctx: Context, showId: number) {
  try {
    const { data } = await ctx.integrations.tvmaze.get<EpisodeList>(`/shows/${showId}/episodes`);

    validateEpisodeList(data);
    return data;
  } catch {
    throw new Error("Erro ao consultar episódios no TVmaze");
  }
}
