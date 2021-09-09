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

import { act } from "react-dom/test-utils";
import { Server } from "mock-socket";

import UpgradePageContainer, { Props } from "../UpgradePageContainer";
import querySpinner from "../../../../test/helpers/querySpinner";
import { UpgradePageExplanation, ErrorMessage } from "../UpgradePage";
import Messages from "./data/socketMessages.json";
import getAvailableSpace from "../../../services/getAvailableSpace";
import wsBaseUrl from "../../../services/wsBaseUrl";
import serverStatus from "../../../services/serverStatus";
import restartWebPortalService from "../../../services/restartWebPortalService";
import getMajorOsUpdates from "../../../services/getMajorOsUpdates";
import { OsVersionUpdate } from "../../../types/OsVersionUpdate";


jest.mock("../../../services/getAvailableSpace");
jest.mock("../../../services/serverStatus");
jest.mock("../../../services/restartWebPortalService");
jest.mock("../../../services/getMajorOsUpdates");

const getAvailableSpaceMock = getAvailableSpace as jest.Mock;
const serverStatusMock = serverStatus as jest.Mock;
const restartWebPortalServiceMock = restartWebPortalService as jest.Mock;
const getMajorOsUpdatesMock = getMajorOsUpdates as jest.Mock;

type ExtendedRenderResult = RenderResult & {
  waitForPreparation: () => Promise<HTMLElement>,
  waitForUpgradeFinish: () => any,
  queryByTestId: BoundFunction<QueryByBoundAttribute>,
};

let server: Server;

const createServer = () => {
  if (server) {
    server.close();
  }
  return new Server(`${wsBaseUrl}/os-upgrade`);
};

describe("UpgradePageContainer", () => {
  let defaultProps: Props;
  let mount: (props?: Props) => ExtendedRenderResult;

  beforeEach(async () => {
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
    }

    serverStatusMock.mockResolvedValue("OK");
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
              UpgradePageExplanation.UpgradePreparedWithDownload
                .replace("{size}", "100 kB")
                .replace("{time}", "a few")
            )
          ),
        waitForUpgradeFinish: async () => {
          await Promise.all(UpgradePageExplanation.Finish
            .replace("{continueButtonLabel}", "Next")
            .replace("{continueButtonAction}", "continue")
            .split("\n").map(async (text, _): Promise<any> => {
            text && await waitForElement(() => result.getByText(text))
          }))
        },
      };
    };
  });

  afterEach(() => {
    getAvailableSpaceMock.mockRestore();
    serverStatusMock.mockRestore();
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

  it("Upgrade button is disabled", async () => {
    const { getByText } = mount();

    expect(getByText("Update")).toHaveProperty("disabled", true);
  });

  it("Back button is present", async () => {
    const { getByText } = mount();

    expect(getByText("Back")).toBeInTheDocument();
  });

  it("calls goToPreviousPage when back button clicked", async () => {
    const { getByText } = mount();

    fireEvent.click(getByText("Back"));
    expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
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

  describe("while preparing updates", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
          }

          if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }
        });
      });
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

    it("renders progress bar correctly", async () => {
      const { findByTestId, queryByTestId } = mount();

      await findByTestId("progress");
      const progressBar = queryByTestId("progress");
      expect(progressBar).toMatchSnapshot();
    });

    it("doesn't render the Skip button", async () => {
      const { queryByText } = mount();

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("renders the preparing upgrade message", () => {
      const { queryByText } = mount();

      expect(queryByText(UpgradePageExplanation.Preparing)).toBeInTheDocument();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText } = mount();

      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Back button is present", async () => {
      const { getByText } = mount();

      expect(getByText("Back")).toBeInTheDocument();
    });

    it("calls goToPreviousPage when back button clicked", async () => {
      const { getByText } = mount();

      fireEvent.click(getByText("Back"));
      expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
    });

  });

  describe("when updates are prepared", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
          }
        });
      });
    });

    it("renders the 'upgrade is prepared' message", async () => {
      const { waitForPreparation } = mount();
      await waitForPreparation();
    });

    it("stops rendering the textarea component", async () => {
      const { waitForPreparation, container: upgradePage } = mount();

      await waitForPreparation();

      const textAreaElement = upgradePage.querySelector(".textarea");
      expect(textAreaElement).not.toBeInTheDocument()
    });

    it("Upgrade button is enabled", async () => {
      const { getByText, waitForPreparation } = mount();

      await waitForPreparation();

      expect(getByText("Update")).toHaveProperty("disabled", false);
    });

    it("starts upgrade when Upgrade button clicked", async () => {
      const { getByText, waitForPreparation } = mount();

      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));
    });

    it("Skip button is not present", async () => {
      const { queryByText } = mount();

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

  });

  describe("when preparation fails", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", () => {
          socket.send(JSON.stringify(Messages.PrepareError));
        });
      });
    });

    it("renders the error message", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });

    it("renders the textarea component", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("doesn't render the 'preparing updates' message", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() => getByText(ErrorMessage.GenericError));

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
  });

  describe("when the upgrade is being installed", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
          }
        });
      });
    });

    it("renders the 'upgrade is in progress' message", async () => {
      const { getByText, waitForPreparation, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      await waitForElement(() =>
        queryByText(UpgradePageExplanation.InProgress)
      );
    });

    it("renders progress bar correctly", async () => {
      const { getByText, waitForPreparation, container: upgradePage } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForElement(() => upgradePage.querySelector(".progress"));
      const progressBar = upgradePage.querySelector(".progress");
      expect(progressBar).toMatchSnapshot();
    });

    it("renders the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Back button is not rendered", async () => {
      const { getByText, queryByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      expect(queryByText("Back")).not.toBeInTheDocument();
    });

    it("Skip button is not present", async () => {
      const { queryByText } = mount();

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });
  });

  describe("when the upgrade fails", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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

    it("renders the error message", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });

    it("doesn't render the 'upgrading' message", async () => {
      const { getByText, waitForPreparation, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      expect(
        queryByText(UpgradePageExplanation.InProgress)
      ).not.toBeInTheDocument();
    });

    it("renders the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Back button is enabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForElement(() => getByText(ErrorMessage.GenericError));
      expect(getByText("Back")).toHaveProperty("disabled", false);
    });

    it("Skip button is enabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      await waitForElement(() => getByText("Skip"));
      expect(getByText("Skip")).toHaveProperty("disabled", false);
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });
  });

  describe("when the upgrade finishes", () => {
    beforeEach(() => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          if (data === "prepare") {
            socket.send(JSON.stringify(Messages.PrepareStart));
            socket.send(JSON.stringify(Messages.PrepareFinish));
          }
          else if (data === "size") {
            socket.send(JSON.stringify(Messages.Size));
          }
          else if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            socket.send(JSON.stringify(Messages.UpgradeFinish));
          }
          else if (data === "cleanup") {
            socket.send(JSON.stringify(Messages.CleanupStart));
            socket.send(JSON.stringify(Messages.CleanupStatus));
            socket.send(JSON.stringify(Messages.CleanupFinish));
          }
        });
      });
    });
    afterEach(() => {
      jest.useRealTimers();
      restartWebPortalServiceMock.mockRestore();
      serverStatusMock.mockRestore();
    })

    it("renders the upgrade finished message", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();
    });

    it("renders progress bar correctly", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish, container: upgradePage } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(upgradePage.querySelector(".progress")).toMatchSnapshot();
    });

    it("renders the textarea component", async () => {
      const { waitForUpgradeFinish, waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      await findByTestId("textarea");
      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("messages are displayed in the textarea component", async () => {
      const { waitForUpgradeFinish, waitForPreparation, getByText, findByTestId, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Upgrade button is not present", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Next button is present", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(queryByText("Next")).toBeInTheDocument();
    });

    it("requests to restart the pt-os-web-portal systemd service", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();
      jest.useFakeTimers();

      fireEvent.click(getByText("Next"));
      await wait();
      jest.runOnlyPendingTimers();
      expect(restartWebPortalServiceMock).toHaveBeenCalled();
    });

    it("doesn't display an error message when restartWebPortalService fails", async () => {
      // we expect restartWebPortalService to fail since the backend server restarts
      restartWebPortalServiceMock.mockRejectedValue(new Error("couldn't restart"));
      const { queryByText, getByText, waitForUpgradeFinish, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();
      jest.useFakeTimers();

      fireEvent.click(getByText("Next"));
      await wait();
      jest.runOnlyPendingTimers();
      expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
    });

    it("calls goToNextPage when next button clicked", async () => {
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

    describe("when pt-os-web-portal server is restarting", () => {
      afterEach(() => {
        jest.useRealTimers();
        restartWebPortalServiceMock.mockRestore();
        serverStatusMock.mockRestore();
      })

      it("renders a spinner", async () => {
        const { container: upgradePage, waitForUpgradeFinish, getByText, waitForPreparation } = mount();
        await waitForPreparation();
        fireEvent.click(getByText("Update"));
        await waitForUpgradeFinish();
        jest.useFakeTimers();

        fireEvent.click(getByText("Next"));
        await wait();
        jest.runOnlyPendingTimers();
        expect(querySpinner(upgradePage)).toBeInTheDocument();
      });

      it("renders a 'please wait' message", async () => {
        const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
        await waitForPreparation();
        fireEvent.click(getByText("Update"));
        await waitForUpgradeFinish();
        jest.useFakeTimers();

        fireEvent.click(getByText("Next"));
        await wait();
        jest.runOnlyPendingTimers();
        await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer));
      });

      it("probes backend server to determine if its online", async () => {
        const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
        await waitForPreparation();
        fireEvent.click(getByText("Update"));
        await waitForUpgradeFinish();
        jest.useFakeTimers();

        fireEvent.click(getByText("Next"));
        await wait();
        jest.runOnlyPendingTimers();
        expect(serverStatusMock).toHaveBeenCalledTimes(1);
      });

      it("probes backend server until its online", async () => {
        const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
        await waitForPreparation();
        fireEvent.click(getByText("Update"));
        await waitForUpgradeFinish();
        jest.useFakeTimers();

        serverStatusMock.mockRejectedValue(new Error("I'm offline"));
        fireEvent.click(getByText("Next"));

        // checks twice
        jest.runOnlyPendingTimers();
        expect(serverStatusMock).toBeCalledTimes(1);
        jest.runOnlyPendingTimers();
        expect(serverStatusMock).toHaveBeenCalledTimes(2);
        // server is back online
        serverStatusMock.mockResolvedValue("OK");
        jest.runOnlyPendingTimers();
        expect(serverStatusMock).toHaveBeenCalledTimes(3);
        await wait();
        jest.runOnlyPendingTimers();
        // we don't check again
        expect(serverStatusMock).toHaveBeenCalledTimes(3);
      });

      it("doesn't render the textarea component", async () => {
        const { waitForUpgradeFinish, waitForPreparation, getByText, queryByTestId } = mount();
        await waitForPreparation();
        fireEvent.click(getByText("Update"));
        await waitForUpgradeFinish();
        jest.useFakeTimers();

        fireEvent.click(getByText("Next"));
        await wait();
        jest.runOnlyPendingTimers();

        expect(queryByTestId("textarea")).not.toBeInTheDocument();
      });
    });
  });

  describe("when there's not enough space left on device", () => {
    beforeEach(async () => {
      getAvailableSpaceMock.mockResolvedValue(
        Messages.Size.payload.size.requiredSpace +
          Messages.Size.payload.size.downloadSize -
          1000
      );

      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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

    it("renders the error message", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });

    it("Skip button exists", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });
  });

  describe("when unable to get available space", () => {
    beforeEach(async () => {
      getAvailableSpaceMock.mockRejectedValue(
        new Error("nah mate couldn't tell ya")
      );
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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

    it("renders the error message", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });

    it("Skip button exists", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });
  });

  describe("when there are major OS updates available and user 'shouldBurn'", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", () => {
          socket.send(JSON.stringify(Messages.PrepareStart));
        });
      });
      let osUpdatesResponse: OsVersionUpdate;
      osUpdatesResponse = {
        shouldBurn: true,
        requireBurn: false,
        latestOSVersion: "",
        update: false,
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).not.toHaveClass("hidden");
    });

    it("hides the dialog on Close click", async() => {
      const { queryByTestId, getByText } = mount();
      await wait();
      fireEvent.click(getByText("Close"));

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });

    it("renders the correct message", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).toMatchSnapshot();
    });

  })

  describe("when there are major OS updates available and user 'requireBurn'", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", () => {
          socket.send(JSON.stringify(Messages.PrepareStart));
        });
      });
      let osUpdatesResponse: OsVersionUpdate;
      osUpdatesResponse = {
        shouldBurn: true,
        requireBurn: true,
        latestOSVersion: "",
        update: false,
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).not.toHaveClass("hidden");
    });

    it("hides the dialog on Close click", async() => {
      const { queryByTestId, getByText } = mount();
      await wait();
      fireEvent.click(getByText("Close"));

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });

    it("renders the correct message", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).toMatchSnapshot();
    });
  })

  describe("when checking for major OS updates fails", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", () => {
          socket.send(JSON.stringify(Messages.PrepareStart));
        });
      });
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockRejectedValue(new Error("couldn't restart"));
    });

    it("new OS version dialog is not displayed", async () => {
      const { queryByTestId } = mount();
      await wait();

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });
  })
});
