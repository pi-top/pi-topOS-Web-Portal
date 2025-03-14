import api from "../api";

import configureLanding from "../configureLanding";

jest.mock("../api");

describe("configureLanding", () => {
  it("posts to route correctly", async () => {
    await configureLanding();

    expect(api.post).toHaveBeenCalledWith("/configure-landing", {});
  });
});
