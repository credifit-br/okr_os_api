import { api } from "../api";
import { User } from "../models";

function formatUser(user: User) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  };
}

api.fn.getUsers = async ctx => {
  const users = await ctx.db.user.find();

  return users.map(formatUser);
};

api.fn.createUser = async (ctx, { name, age }) => {
  const splitName = name.split(" ");

  if (splitName.length !== 2) {
    throw api.err.InvalidArgument(ctx.tr`Nome inválido`);
  }

  const [firstName, lastName] = splitName;

  const createdUser = await ctx.db.user.save({
    age,
    firstName,
    lastName,
  });

  return formatUser(createdUser);
};
