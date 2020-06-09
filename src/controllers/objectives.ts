import { api } from "../api";

api.fn.getObjectives = async ctx => {
  return ctx.db.objective.find();
};
