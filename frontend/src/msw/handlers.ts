import { rest } from "msw";

export default [
  rest.get("/rover-controller-status", async (_, res, ctx) => {
    return res(ctx.json({ status: "inactive" }));
  }),
];
