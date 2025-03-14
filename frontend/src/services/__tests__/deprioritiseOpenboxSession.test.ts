import api from "../api";

import deprioritiseOpenboxSession from "../deprioritiseOpenboxSession";

jest.mock("../api");

describe("deprioritiseOpenboxSession", () => {
  it("posts to route correctly", async () => {
    await deprioritiseOpenboxSession();

    expect(api.post).toHaveBeenCalledWith(
      "/deprioritise-openbox-session",
      {},
    );
  });
});
