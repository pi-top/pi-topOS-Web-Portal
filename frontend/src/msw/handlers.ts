import { rest } from "msw";
import networks from "./data/networks.json";

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
  rest.get("/is-connected", (_, res, ctx) => {
    return res(ctx.json({ connected: false }));
  }),
  rest.get("/is-connected-through-ap", (_, res, ctx) => {
    return res(ctx.json({ isUsingAp: true }));
  }),
  rest.get("/wifi-ssids", (_, res, ctx) => {
    return res(ctx.json(networks));
  }),
  rest.get('/current-wifi-bssid', (_, res, ctx) => {
    return res(ctx.json(""))
  }),
  rest.post<{ bssid: string; password: string }>(
    "/wifi-credentials",
    (req, res, ctx) => {
      if (req.body.password === "incorrect-password") {
        return res(ctx.status(401));
      }
      return res(ctx.status(200));
    }
  ),
];
