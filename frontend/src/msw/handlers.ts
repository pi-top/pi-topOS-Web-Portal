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
  rest.get("/build-info", (_, res, ctx) => {
    return res(
      ctx.json({
        buildDate: "2021-09-01T00:00:00Z",
        buildNumber: "123",
        buildCommit: "1234567890",
        schemaVersion: "1.0.0",
        buildOsVersion: "1.0.0",
        buildType: "dev",
        buildName: "dev",
        buildRepo: "dev",
        finalRepo: "dev",
        ptOsWebPortalVersion: "1.0.0",
        hubFirmwareVersion: "1.0.0",
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
    return res(ctx.json({ connected: true }));
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
