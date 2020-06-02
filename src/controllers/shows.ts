import { api } from "../api";
import { getEpisodes } from "../integrations/tvmaze";

api.fn.getEpisodes = async (ctx, { showId }) => {
  return (await getEpisodes(ctx, showId)).map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
  }));
};
