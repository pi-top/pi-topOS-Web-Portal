import { rest } from "msw";

export default [
  rest.post("/disable-landing", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.get("/python-sdk-docs-url", (_, res, ctx) => {
    return res(
      ctx.json({
        url: "https://pi-top-pi-top-python-sdk.readthedocs-hosted.com",
      })
    );
  }),
  rest.get("/further-url", (_, res, ctx) => {
    return res(ctx.json({ url: "https://further.pi-top.com" }));
  }),
  rest.get("/rover-controller-status", (_, res, ctx) => {
    return res(ctx.json({ status: "inactive" }));
  }),
  rest.post("/rover-controller-start", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.post("/rover-controller-stop", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
];
