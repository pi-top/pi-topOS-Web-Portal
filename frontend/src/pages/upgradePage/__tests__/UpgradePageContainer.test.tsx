import React from "react";
import {
  render,
  fireEvent,
  RenderResult,
  waitForElement,
  wait,
  BoundFunction,
  QueryByBoundAttribute,
} from "@testing-library/react";

import { Server } from "mock-socket";

import UpgradePageContainer, { Props } from "../UpgradePageContainer";
import querySpinner from "../../../../test/helpers/querySpinner";
import { UpgradePageExplanation, ErrorMessage } from "../UpgradePage";
import Messages from "./data/socketMessages.json";
import getAvailableSpace from "../../../services/getAvailableSpace";
import wsBaseUrl from "../../../services/wsBaseUrl";
import axios from "axios";
import restartWebPortalService from "../../../services/restartWebPortalService";
import getMajorOsUpdates from "../../../services/getMajorOsUpdates";
import { OsVersionUpdate } from "../../../types/OsVersionUpdate";
import { waitFor } from "../../../../test/helpers/waitFor";

jest.mock("axios");
jest.mock("../../../services/getAvailableSpace");
jest.mock("../../../services/restartWebPortalService");
jest.mock("../../../services/getMajorOsUpdates");

const axiosGetMock = axios.get as jest.Mock;
const getAvailableSpaceMock = getAvailableSpace as jest.Mock;
const restartWebPortalServiceMock = restartWebPortalService as jest.Mock;
const getMajorOsUpdatesMock = getMajorOsUpdates as jest.Mock;

type ExtendedRenderResult = RenderResult & {
  waitForPreparation: () => Promise<HTMLElement>;
  waitForGenericError: () => any;
  waitForInstallingPackages: () => any;
  waitForUpgradeFinish: () => any;
  queryByTestId: BoundFunction<QueryByBoundAttribute>;
  waitForNotEnoughSpaceError: () => any;
};

let server: Server;

const createServer = () => {
  if (server) {
    server.close();
  }
  return new Server(`${wsBaseUrl}/os-upgrade`);
};

Object.defineProperty(window, "location", {
  writable: true,
  value: { replace: jest.fn(), search: "" },
});

describe("UpgradePageContainer", () => {
  let defaultProps: Props;
  let mount: (props?: Props) => ExtendedRenderResult;

  beforeEach(async () => {
    window.location.search = "";

    // we want to have enough space on the device by default
    getAvailableSpaceMock.mockResolvedValue(
      Messages.Size.payload.size.requiredSpace +
        Messages.Size.payload.size.downloadSize +
        1000
    );

    // no major OS updates are available by default
    let osUpdatesResponse: OsVersionUpdate;
    osUpdatesResponse = {
      shouldBurn: false,
      requireBurn: false,
      latestOSVersion: "",
      update: false,
    };

    axiosGetMock.mockResolvedValue("OK");
    restartWebPortalServiceMock.mockResolvedValue("OK");
    getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);

    server = createServer();
    server.on("connection", (socket) => {
      socket.on("message", () => {});
    });

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      isCompleted: false,
    };

    mount = (props = defaultProps) => {
      const result = render(<UpgradePageContainer {...props} />);
      return {
        ...result,
        waitForPreparation: async () =>
          waitForElement(() =>
            result.getByText(
              UpgradePageExplanation.UpgradePreparedWithDownload.replace(
                "{size}",
                "100 kB"
              ).replace("{time}", "a few")
            )
          ),
        waitForUpgradeFinish: async () => {
          await Promise.all(
            UpgradePageExplanation.Finish.replace(
              "{continueButtonLabel}",
              "Next"
            )
              .replace("{continueButtonAction}", "continue")
              .split("\n")
              .map(async (text, _): Promise<any> => {
                text && (await waitForElement(() => result.getByText(text)));
              })
          );
        },
        waitForGenericError: async () => {
          await Promise.all(
            ErrorMessage.GenericError.split("\n").map(
              async (text, _): Promise<any> => {
                text && (await waitForElement(() => result.getByText(text)));
              }
            )
          );
        },
        waitForNotEnoughSpaceError: async () => {
          await Promise.all(
            ErrorMessage.NoSpaceAvailable.split("\n").map(
              async (text, _): Promise<any> => {
                text && (await waitForElement(() => result.getByText(text)));
              }
            )
          );
        },
        waitForInstallingPackages: async () => {
          await Promise.all(
            UpgradePageExplanation.InProgress.split("\n").map(
              async (text, _): Promise<any> => {
                text && (await waitForElement(() => result.getByText(text)));
              }
            )
          );
        },
      };
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    getAvailableSpaceMock.mockRestore();
    axiosGetMock.mockResolvedValue("OK");
    restartWebPortalServiceMock.mockRestore();
  });

  it("renders the correct banner image", async () => {
    const { queryByAltText } = mount();
    await wait();

    expect(queryByAltText("upgrade-page-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", async () => {
    const { container: upgradePage } = mount();

    const prompt = upgradePage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("Update button is present", async () => {
    const { getByText } = mount();

    expect(getByText("Update")).toBeInTheDocument();
  });

  it("Update button is hidden", async () => {
    const { getByText } = mount();

    expect(getByText("Update").parentElement).toHaveClass("hidden");
  });

  it("Back button isn't present", async () => {
    const { queryByText } = mount();

    expect(queryByText("Back")).not.toBeInTheDocument();
  });

  it("Skip button is not present", async () => {
    const { queryByText } = mount();

    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("renders the new OS version available dialog", async () => {
    const { queryByTestId } = mount();

    expect(queryByTestId("dialog")).toBeInTheDocument();
  });

  it("hides the new OS version available dialog", async () => {
    const { queryByTestId } = mount();

    expect(queryByTestId("dialog")).toHaveClass("hidden");
  });

  describe("while updating sources", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
          }
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the 'updating sources' message", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );

      expect(
        getByText(UpgradePageExplanation.UpdatingSources)
      ).toBeInTheDocument();
    });

    it("renders the textarea component", async () => {
      const { findByTestId, queryByTestId } = mount();

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { findByTestId, queryByTestId } = mount();

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("doesn't render progress bar", async () => {
      const { container: upgradePage } = mount();

      expect(upgradePage.querySelector(".progress")).not.toBeInTheDocument();
    });

    it("doesn't render the Skip button", async () => {
      const { queryByText, getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("Update button is hidden", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );

      expect(getByText("Update").parentElement).toHaveClass("hidden");
    });

    it("Back button isn't present", async () => {
      const { queryByText, getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );

      expect(queryByText("Back")).not.toBeInTheDocument();
    });
  });

  describe("when sources are updated and there are updates to the web-portal package", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
          }

          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the 'preparing your system to be updated' message", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );
    });

    it("renders the textarea component", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      await waitFor(() => {
        const textAreaElement = upgradePage.querySelector(".textarea");
        expect(textAreaElement).toBeInTheDocument();
      });
    });

    it("textarea component displays web-portal upgrade messages", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Update button is hidden", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      expect(getByText("Update").parentElement).toHaveClass("hidden");
    });
  });

  describe("when sources are updated and there are no updates to the web-portal package", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }

          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.NoSize));
          }
        });
      });
    });

    it("renders the 'please wait' message while restarting the web-portal service", async () => {
      const { getByText } = mount();
      await waitFor(() =>
        expect(
          getByText(UpgradePageExplanation.WaitingForServer)
        ).toBeInTheDocument()
      );
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitFor(() => getByText(UpgradePageExplanation.WaitingForServer));

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("doesn't render the textarea component", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.WaitingForServer)
      );

      await waitFor(() => {
        const textAreaElement = upgradePage.querySelector(".textarea");
        expect(textAreaElement).not.toBeInTheDocument();
      });
    });

    it("Update button is hidden", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.WaitingForServer)
      );

      expect(getByText("Update").parentElement).toHaveClass("hidden");
    });

    it("calls window.location.replace to reload the page", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.WaitingForServer)
      );
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          window.location.href + "?all"
        )
      );
    });

    it("calls goToNextPage if skipSystemUpgrade flag is set", async () => {
      mount({ skipSystemUpgrade: true, ...defaultProps });
      await waitFor(() =>
        expect(defaultProps.goToNextPage).toHaveBeenCalled()
      );
    });
  });

  describe("when updating sources fails", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesError));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { waitForGenericError, container: upgradePage } = mount();
      await waitForGenericError();

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the error message", async () => {
      const { waitForGenericError } = mount();
      await waitForGenericError();
    });

    it("renders the textarea component", async () => {
      const { waitForGenericError, findByTestId, queryByTestId } = mount();
      await waitForGenericError();

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { waitForGenericError, findByTestId, queryByTestId } = mount();
      await waitForGenericError();

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("doesn't render the 'preparing updates' message", async () => {
      const { waitForGenericError, queryByText } = mount();
      await waitForGenericError();

      expect(
        queryByText(UpgradePageExplanation.Preparing)
      ).not.toBeInTheDocument();
    });

    it("Skip button exists", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText("Skip"));
    });

    it("Back button exists", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText("Back"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const { queryByText, waitForGenericError } = mount();
      await waitForGenericError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForGenericError, queryByText, getByText } = mount();
      await waitForGenericError();

      expect(queryByText("Retry")).toBeInTheDocument();
      expect(getByText("Retry").parentElement).toHaveProperty(
        "disabled",
        false
      );
    });

    describe("and the Retry button is pressed", () => {
      beforeEach(async () => {
        server = createServer();
        let times = 0;
        server.on("connection", (socket) => {
          socket.on("message", (data) => {
            if (data === "state") {
              socket.send(JSON.stringify(Messages.StateNotBusy));
            }
            if (data === "update_sources") {
              socket.send(JSON.stringify(Messages.UpdateSourcesStart));
              socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
              if (times == 0) {
                socket.send(JSON.stringify(Messages.UpdateSourcesError));
                times = times + 1;
              }
            }
          });
        });
      });

      it("restarts the update process when Retry button is pressed", async () => {
        const { queryByText, waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await wait();

        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );
        expect(
          queryByText(UpgradePageExplanation.UpdatingSources)
        ).toBeInTheDocument();
      });

      it("renders prompt correctly", async () => {
        const {
          waitForGenericError,
          getByText,
          container: upgradePage,
        } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        const prompt = upgradePage.querySelector(".prompt");
        expect(prompt).toMatchSnapshot();
      });

      it("doesn't render the error message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
      });

      it("renders the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } =
          mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        await findByTestId("textarea");
        expect(queryByTestId("textarea")).toBeInTheDocument();
      });

      it("messages are displayed in the textarea component", async () => {
        const { getByText, findByTestId, queryByTestId, waitForGenericError } =
          mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await wait();
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        await findByTestId("textarea");
        await waitFor(() => {
          const textAreaElement = queryByTestId("textarea");
          expect(textAreaElement).toMatchSnapshot();
        });
      });

      it("doesn't render the 'preparing updates' message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        expect(
          queryByText(UpgradePageExplanation.Preparing)
        ).not.toBeInTheDocument();
      });

      it("Skip button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        expect(queryByText("Skip")).not.toBeInTheDocument();
      });

      it("Back button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        expect(queryByText("Back")).not.toBeInTheDocument();
      });

      it("Retry button isn't rendered", async () => {
        const { queryByText, waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        expect(queryByText("Retry")).not.toBeInTheDocument();
      });

      it("Update button is hidden", async () => {
        const { waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        await waitForElement(() => getByText("Update"));
        expect(getByText("Update").parentElement).toHaveClass("hidden");
      });
    });
  });

  describe("while updating web-portal", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }

          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the updating web-portal message", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );
    });

    it("renders the textarea component", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("textarea component displays web-portal upgrade messages", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Update button is hidden", async () => {
      const { getByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update").parentElement).toHaveClass("hidden");
    });

    it("Skip button is not present", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingWebPortal)
      );

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });
  });

  describe("when updating web-portal succeeds", () => {
    beforeEach(async () => {
      // we expect restartWebPortalService to fail since the backend server restarts
      restartWebPortalServiceMock.mockRejectedValue(
        new Error("backend server restarted")
      );
      axiosGetMock.mockResolvedValue("OK");

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            socket.send(JSON.stringify(Messages.UpgradeFinish));
          }
        });
      });
    });

    it("probes backend server to determine if its online", async () => {
      const {
        queryByText,
        queryByTestId,
        getByText,
        container: upgradePage,
      } = mount();
      await waitForElement(() =>
        getByText(UpgradePageExplanation.WaitingForServer)
      );

      expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update").parentElement).toHaveClass("hidden");

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();

      await waitFor(() => expect(queryByTestId("textarea")).not.toBeInTheDocument());

      await waitFor(() => expect(querySpinner(upgradePage)).toBeInTheDocument());

      await wait(() => expect(window.location.replace).toHaveBeenCalled());
    });
  });

  describe("when updating web-portal fails", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            if (times === 0) {
              socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
            }
          }

          if (times === 0 && data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (times === 0 && data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (times === 0 && data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            socket.send(JSON.stringify(Messages.UpgradeError));
            times = times + 1;
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { waitForGenericError, container: upgradePage } = mount();
      await waitForGenericError();

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the error message", async () => {
      const { waitForGenericError } = mount();
      await waitForGenericError();
    });

    it("Skip button is present", async () => {
      const { waitForGenericError, queryByText } = mount();
      await waitForGenericError();

      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { waitForGenericError, getByText } = mount();
      await waitForGenericError();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const { queryByText, waitForGenericError } = mount();
      await waitForGenericError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForGenericError, queryByText, getByText } = mount();
      await waitForGenericError();

      expect(queryByText("Retry")).toBeInTheDocument();
      expect(getByText("Retry").parentElement).toHaveProperty(
        "disabled",
        false
      );
    });

    it("renders the textarea component", async () => {
      const { waitForGenericError, queryByTestId } = mount();
      await waitForGenericError();

      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    describe("and the Retry button is pressed", () => {
      it("renders prompt correctly", async () => {
        const {
          waitForGenericError,
          getByText,
          container: upgradePage,
        } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        const prompt = upgradePage.querySelector(".prompt");
        expect(prompt).toMatchSnapshot();
      });

      it("tries to update again again", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );
        expect(
          queryByText(UpgradePageExplanation.UpdatingSources)
        ).toBeInTheDocument();
      });

      it("doesn't render the error message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );
        expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
      });

      it("renders the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } =
          mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );

        await findByTestId("textarea");
        expect(queryByTestId("textarea")).toBeInTheDocument();
      });

      it("messages are displayed in the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } =
          mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await wait();
        await waitForElement(() =>
          getByText(UpgradePageExplanation.UpdatingSources)
        );
        await wait();

        await waitForElement(() => findByTestId("textarea"));
        const textAreaElement = queryByTestId("textarea");
        expect(textAreaElement).toMatchSnapshot();
      });

      it("Skip button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        expect(queryByText("Skip")).not.toBeInTheDocument();
      });

      it("Back button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        expect(queryByText("Back")).not.toBeInTheDocument();
      });

      it("Retry button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        expect(queryByText("Retry")).not.toBeInTheDocument();
      });

      it("Update button is hidden", async () => {
        const { waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        await waitForElement(() => getByText("Update"));
        expect(getByText("Update").parentElement).toHaveClass("hidden");
      });
    });
  });

  describe("after web-portal is updated", () => {
    beforeEach(async () => {
      window.location.search = "?all";

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }
          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }
          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }
        });
      });
    });

    it("calls goToNextPage when skipSystemUpgrade is true", async () => {
      mount({
        ...defaultProps,
        skipSystemUpgrade: true,
      });
      await waitFor(() => expect(defaultProps.goToNextPage).toHaveBeenCalled());
    });

    it("checks for system updates when skipSystemUpgrade is false", async () => {
      const { waitForPreparation } = mount({
        ...defaultProps,
        skipSystemUpgrade: false,
      });
      await waitForPreparation();
      expect(defaultProps.goToNextPage).not.toHaveBeenCalled();
    });
  });

  describe("after web-portal is updated and there are no system updates", () => {
    beforeEach(async () => {
      window.location.search = "?all";

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            // no updates are available
            socket.send(JSON.stringify(Messages.NoSize));
          }
        });
      });
    });

    it("calls goToNextPage when skipSystemUpgrade is true", async () => {
      mount({
        ...defaultProps,
        skipSystemUpgrade: true,
      });
      await waitFor(() => expect(defaultProps.goToNextPage).toHaveBeenCalled());
    });

    it("renders prompt correctly", async () => {
      const { waitForUpgradeFinish, container: upgradePage } = mount();
      await waitForUpgradeFinish();

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("doesn't render the progress bar", async () => {
      const { waitForUpgradeFinish, container: upgradePage } = mount();
      await waitForUpgradeFinish();

      expect(upgradePage.querySelector(".progress")).not.toBeInTheDocument();
    });

    it("doesn't render the textarea component", async () => {
      const { waitForUpgradeFinish, queryByTestId } = mount();
      await waitForUpgradeFinish();

      expect(queryByTestId("textarea")).not.toBeInTheDocument();
    });

    it("Next button is present", async () => {
      const { getByText, waitForUpgradeFinish } = mount();
      await waitForUpgradeFinish();

      expect(getByText("Next")).toBeInTheDocument();
    });

    it("pressing the Next button calls goToNextPage", async () => {
      const { getByText, waitForUpgradeFinish } = mount();
      await waitForUpgradeFinish();

      fireEvent.click(getByText("Next"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Back button is rendered", async () => {
      const { getByText, waitForUpgradeFinish } = mount();
      await waitForUpgradeFinish();

      expect(getByText("Back")).toBeInTheDocument();
    });

    it("Skip button is not present", async () => {
      const { queryByText, waitForUpgradeFinish } = mount();
      await waitForUpgradeFinish();

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });
  });

  describe("when the system is being updated", () => {
    beforeEach(async () => {
      window.location.search = "?all";

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, waitForPreparation, container: upgradePage } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the 'upgrade is in progress' message", async () => {
      const { getByText, waitForPreparation, waitForInstallingPackages } =
        mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForInstallingPackages();
    });

    it("doesn't render the progress bar", async () => {
      const { getByText, waitForPreparation, container: upgradePage } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      expect(upgradePage.querySelector(".progress")).not.toBeInTheDocument();
    });

    it("renders the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } =
        mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } =
        mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Update button is hidden", async () => {
      const { getByText, waitForPreparation, waitForInstallingPackages } =
        mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForInstallingPackages();

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update").parentElement).toHaveClass("hidden");
    });

    it("Back button is not rendered", async () => {
      const {
        getByText,
        queryByText,
        waitForInstallingPackages,
        waitForPreparation,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForInstallingPackages();

      expect(queryByText("Back")).not.toBeInTheDocument();
    });

    it("Skip button is not present", async () => {
      const { queryByText } = mount();

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });
  });

  describe("when the system upgrade fails", () => {
    beforeEach(async () => {
      window.location.search = "?all";

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            socket.send(JSON.stringify(Messages.UpgradeError));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const {
        waitForGenericError,
        container: upgradePage,
        getByText,
        waitForPreparation,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForGenericError();

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the error message", async () => {
      const { waitForGenericError, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForGenericError();
    });

    it("doesn't render the 'is upgrading' message", async () => {
      const {
        getByText,
        waitForPreparation,
        waitForGenericError,
        queryByText,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await Promise.all(
        UpgradePageExplanation.InProgress.split("\n").map(
          async (text, _): Promise<any> => {
            text && expect(queryByText(text)).not.toBeInTheDocument();
          }
        )
      );
    });

    it("renders the textarea component", async () => {
      const {
        waitForPreparation,
        waitForGenericError,
        getByText,
        findByTestId,
        queryByTestId,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const {
        waitForPreparation,
        waitForGenericError,
        getByText,
        findByTestId,
        queryByTestId,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Back button is enabled", async () => {
      const { waitForGenericError, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForGenericError();
      expect(getByText("Back")).toHaveProperty("disabled", false);
    });

    it("Skip button is enabled", async () => {
      const { waitForGenericError, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await waitForElement(() => getByText("Skip"));
      expect(getByText("Skip")).toHaveProperty("disabled", false);
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { waitForGenericError, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const {
        waitForGenericError,
        queryByText,
        getByText,
        waitForPreparation,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const {
        waitForGenericError,
        queryByText,
        getByText,
        waitForPreparation,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await waitForElement(() => getByText("Retry"));
      expect(queryByText("Retry")).toBeInTheDocument();
    });

    it("Retry button is enabled", async () => {
      const { waitForGenericError, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      await waitForElement(() => getByText("Retry"));
      expect(getByText("Retry").parentElement).toHaveProperty(
        "disabled",
        false
      );
    });

    it("restarts the update process when Retry button is pressed", async () => {
      const { waitForPreparation, waitForGenericError, getByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();
      await waitForElement(() => getByText("Retry"));
      fireEvent.click(getByText("Retry"));

      await waitForElement(() =>
        getByText(UpgradePageExplanation.UpdatingSources)
      );
      expect(
        getByText(UpgradePageExplanation.UpdatingSources)
      ).toBeInTheDocument();
    });
  });

  describe("when the upgrade finishes", () => {
    beforeEach(() => {
      window.location.search = "?all";

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            socket.send(JSON.stringify(Messages.UpgradeFinish));
          }
        });
      });
    });
    afterEach(() => {
      jest.useRealTimers();
      restartWebPortalServiceMock.mockRestore();
      axiosGetMock.mockResolvedValue("OK");
    });

    it("renders prompt correctly", async () => {
      const {
        container: upgradePage,
        getByText,
        waitForPreparation,
        waitForUpgradeFinish,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the upgrade finished message", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();
    });

    it("doesn't render the progress bar", async () => {
      const {
        getByText,
        waitForPreparation,
        waitForUpgradeFinish,
        container: upgradePage,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(upgradePage.querySelector(".progress")).not.toBeInTheDocument();
    });

    it("renders the textarea component", async () => {
      const {
        waitForUpgradeFinish,
        waitForPreparation,
        getByText,
        findByTestId,
        queryByTestId,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const {
        waitForUpgradeFinish,
        waitForPreparation,
        getByText,
        findByTestId,
        queryByTestId,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Upgrade button is not present", async () => {
      const {
        getByText,
        waitForPreparation,
        waitForUpgradeFinish,
        queryByText,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Next button is present", async () => {
      const {
        getByText,
        waitForPreparation,
        waitForUpgradeFinish,
        queryByText,
      } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(queryByText("Next")).toBeInTheDocument();
    });

    it("Next button is enabled", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      await waitForElement(() => getByText("Next"));
      expect(getByText("Next").parentElement).toHaveProperty("disabled", false);
    });

    it("doesn't request to restart the pt-os-web-portal systemd service", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();
      jest.useFakeTimers();

      fireEvent.click(getByText("Next"));
      await wait();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      await wait();
      expect(restartWebPortalServiceMock).not.toHaveBeenCalled();
    });

    it("calls goToNextPage when next button clicked", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      fireEvent.click(getByText("Next"));
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("calls onBackClick when back button clicked", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      fireEvent.click(getByText("Back"));
      expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
    });
  });

  describe("when there's not enough space left on device", () => {
    beforeEach(async () => {
      window.location.search = "?all";

      getAvailableSpaceMock.mockResolvedValue(
        Messages.Size.payload.size.requiredSpace +
          Messages.Size.payload.size.downloadSize -
          1000
      );

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() => getByText(ErrorMessage.NoSpaceAvailable));

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the error message", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText(ErrorMessage.NoSpaceAvailable));
    });

    it("Skip button exists", async () => {
      const { waitForNotEnoughSpaceError, getByText } = mount();
      await waitForNotEnoughSpaceError();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { waitForNotEnoughSpaceError, getByText } = mount();
      await waitForNotEnoughSpaceError();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const { waitForNotEnoughSpaceError, queryByText } = mount();
      await waitForNotEnoughSpaceError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForNotEnoughSpaceError, getByText } = mount();
      await waitForNotEnoughSpaceError();

      await waitForElement(() => getByText("Retry"));
      expect(getByText("Retry")).toBeInTheDocument();
    });

  });

  describe("when unable to get available space", () => {
    beforeEach(async () => {
      getAvailableSpaceMock.mockRejectedValue(
        new Error("nah mate couldn't tell ya")
      );
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }
          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            if (times == 0) {
              socket.send(JSON.stringify(Messages.NoSize));
              times = times + 1;
            } else {
              socket.send(JSON.stringify(Messages.Size));
            }
          }
        });
      });
    });

    it("renders the error message", async () => {
      const { waitForGenericError } = mount();

      await waitForGenericError();
    });

    it("Skip button exists", async () => {
      const { waitForGenericError, getByText } = mount();
      await waitForGenericError();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { waitForGenericError, getByText } = mount();
      await waitForGenericError();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const { waitForGenericError, queryByText } = mount();
      await waitForGenericError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForGenericError, queryByText, getByText } = mount();
      await waitForGenericError();

      expect(queryByText("Retry")).toBeInTheDocument();
      expect(getByText("Retry").parentElement).toHaveProperty(
        "disabled",
        false
      );
    });
  });

  describe("when there are major OS updates available and user 'shouldBurn'", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }

          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            if (times == 0) {
              socket.send(JSON.stringify(Messages.NoSize));
              times = times + 1;
            } else {
              socket.send(JSON.stringify(Messages.Size));
            }
          }
        });
      });
      let osUpdatesResponse: OsVersionUpdate;
      osUpdatesResponse = {
        shouldBurn: true,
        requireBurn: false,
        latestOSVersion: "",
        update: false,
      };
      axiosGetMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { queryByTestId } = mount();

      await waitFor(() =>
        expect(queryByTestId("dialog")).not.toHaveClass("hidden")
      );
    });

    it("hides the dialog on Close click", async () => {
      const { queryByTestId, getByText } = mount();

      await waitFor(() =>
        expect(queryByTestId("dialog")).not.toHaveClass("hidden")
      );

      fireEvent.click(getByText("Close"));

      await waitFor(() =>
        expect(queryByTestId("dialog")).toHaveClass("hidden")
      );
    });

    it("renders the correct message", async () => {
      const { queryByTestId } = mount();

      await waitFor(() => expect(queryByTestId("dialog")).toMatchSnapshot());
    });
  });

  describe("when there are major OS updates available and user 'requireBurn'", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }

          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            if (times == 0) {
              socket.send(JSON.stringify(Messages.NoSize));
              times = times + 1;
            } else {
              socket.send(JSON.stringify(Messages.Size));
            }
          }
        });
      });
      let osUpdatesResponse: OsVersionUpdate;
      osUpdatesResponse = {
        shouldBurn: true,
        requireBurn: true,
        latestOSVersion: "",
        update: false,
      };
      axiosGetMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { queryByTestId } = mount();

      await waitFor(() =>
        expect(queryByTestId("dialog")).not.toHaveClass("hidden")
      );
    });

    it("hides the dialog on Close click", async () => {
      const { getByText, queryByTestId } = mount();
      await waitFor(() =>
        expect(queryByTestId("dialog")).not.toHaveClass("hidden")
      );
      fireEvent.click(getByText("Close"));

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });

    it("renders the correct message", async () => {
      const { queryByTestId } = mount();

      await waitFor(() => expect(queryByTestId("dialog")).toMatchSnapshot());
    });
  });

  describe("when checking for major OS updates fails", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "state") {
            socket.send(JSON.stringify(Messages.StateNotBusy));
          }

          if (data === "update_sources") {
            socket.send(JSON.stringify(Messages.UpdateSourcesStart));
            socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
            socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
          }

          if (data === "prepare" || data === "prepare_web_portal") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }

          if (data === "size") {
            if (times == 0) {
              socket.send(JSON.stringify(Messages.NoSize));
              times = times + 1;
            } else {
              socket.send(JSON.stringify(Messages.Size));
            }
          }
        });
      });
      axiosGetMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockRejectedValue(new Error("couldn't restart"));
    });

    it("new OS version dialog is not displayed", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });
  });
});
