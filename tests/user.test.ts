import { apiTestWrapper } from "@sdkgen/node-runtime";
import { api, Context } from "../src/api";
import "../src/controllers";
import { makeCtx } from "./helpers";

const { fn } = apiTestWrapper(api);

describe("User", () => {
  let ctx: Context;

  beforeAll(() => {
    ctx = makeCtx({});
  });

  test("should return empty array when there's no data", async () => {
    const users = await fn.getUsers(ctx, {});

    expect(users).toBeTruthy();
    expect(users).toStrictEqual([]);
  });

  test("should return users when have data", async () => {
    await fn.createUser(ctx, { age: 25, name: "test test" });

    const users = await fn.getUsers(ctx, {});

    expect(users).toBeTruthy();
    expect(users).toHaveLength(1);
  });

  test("should return error when sending invalid name", async () => {
    try {
      await fn.createUser(ctx, { age: 25, name: "test" });
    } catch (error) {
      expect(error.message).toMatch("Nome inválido");
    }
  });

  test("should create user when sending valid name and age", async () => {
    const user = await fn.createUser(ctx, { age: 25, name: "test test" });

    expect(user.name).toBe("test test");
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
  });
});
