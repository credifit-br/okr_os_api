import { api } from "../api";
import { User } from "../models";

function formatUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
  };
}

api.fn.getUsers = async ctx => {
  const users = await ctx.db.user.find();

  return users.map(formatUser);
};

api.fn.createUser = async (ctx, { name, email }) => {
  const splitName = name.split(" ");

  if (splitName.length !== 2) {
    throw api.err.InvalidArgument(ctx.tr`Nome inválido`);
  }

  const [firstName, lastName] = splitName;

  const createdUser = await ctx.db.user.save({
    email,
    firstName,
    lastName,
  });

  return formatUser(createdUser);
};
