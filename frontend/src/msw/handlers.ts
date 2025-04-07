import { rest } from "msw";
import networks from "./data/networks.json";
import { Network } from "../types/Network";

let connectedNetwork: Network | undefined = undefined;

export const setConnectedNetwork = (network: Network | undefined) => {
  connectedNetwork = network;
};

export default [
  rest.post("/stop-first-boot-app-autostart", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.post("/close-first-boot-app-window", (_, res, ctx) => {
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
  rest.get("/available-space", (_, res, ctx) => {
    return res(ctx.body("20378521600"));
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
  rest.post("/restart-web-portal-service", (_, res, ctx) => {
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
  rest.get("/wifi-connection-info", (_, res, ctx) => {
    return res(
      ctx.json({
        ssid: connectedNetwork?.ssid || "",
        bssid: connectedNetwork?.bssid || "",
        bssidsForSsid: [connectedNetwork?.bssid || ""],
      })
    );
  }),
  rest.post<{ bssid: string; password: string }>(
    "/wifi-credentials",
    (req, res, ctx) => {
      if (req.body.password === "incorrect-password") {
        return res(ctx.status(401));
      }
      setConnectedNetwork(networks.find((n) => n.bssid === req.body.bssid));
      return res(ctx.status(200));
    }
  ),
  rest.get("/status", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.post("/onboarding-miniscreen-ready-to-be-a-maker", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.get("/os-updates", (_, res, ctx) => {
    return res(ctx.json({ shouldBurn: false, requireBurn: false }));
  }),
  rest.post("/start-vnc-wifi-advanced-connection", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.post("/stop-vnc-wifi-advanced-connection", (_, res, ctx) => {
    return res(ctx.body("OK"));
  }),
  rest.get("/vnc-wifi-advanced-connection-url", (_, res, ctx) => {
    return res(ctx.json({ url: "http://localhost" }));
  }),
  rest.get("/should-switch-networks", (_, res, ctx) => {
    return res(
      ctx.json({
        clientIp: "192.168.64.10",
        piTopIp: "192.168.64.1",
        shouldSwitchNetwork: false,
        shouldDisplayDialog: false,
      })
    );
  }),
];
