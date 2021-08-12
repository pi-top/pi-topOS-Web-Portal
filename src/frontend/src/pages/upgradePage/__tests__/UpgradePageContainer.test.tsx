import React from "react";
import {
  render,
  fireEvent,
  RenderResult,
  waitForElement,
  wait,
  queryByText,
} from "@testing-library/react";

import { act } from "react-dom/test-utils";
import { Server } from "mock-socket";

import UpgradePageContainer, { Props } from "../UpgradePageContainer";
import querySpinner from "../../../../test/helpers/querySpinner";
import { UpgradePageExplanation, ErrorMessage, OsBurnExplanation } from "../UpgradePage";
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

    let osUpdatesResponse: OsVersionUpdate;
    osUpdatesResponse = {
      shouldBurn: false,
      requiredBurn: false,
      latestOSVersion: "",
      update: false,
    }

    serverStatusMock.mockResolvedValue("OK");
    restartWebPortalServiceMock.mockResolvedValue("OK");
    getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);

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

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      isCompleted: false,
    };

    mount = (props = defaultProps) => {
      const result = render(<UpgradePageContainer {...props} />);
      return {
        ...result,
        waitForPreparation: () =>
          waitForElement(() =>
            result.getByText(
              UpgradePageExplanation.UpgradePrepared
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
    const { queryByAltText, waitForPreparation } = mount();
    await wait();

    expect(queryByAltText("upgrade-page-banner")).toMatchSnapshot();

    await waitForPreparation();
  });

  it("renders prompt correctly", async () => {
    const { container: upgradePage, waitForPreparation } = mount();
    await wait();

    const prompt = upgradePage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();

    await waitForPreparation();
  });

  it("Upgrade button is disabled if upgrade is not ready", async () => {
    const { getByText, waitForPreparation } = mount();

    expect(getByText("Update")).toHaveProperty("disabled", true);

    await waitForPreparation();
  });

  it("skip button is not present while preparing", async () => {
    const { queryByText, waitForPreparation } = mount();

    expect(queryByText("Skip")).not.toBeInTheDocument();

    await waitForPreparation();
  });

  it("calls goToPreviousPage when back button clicked", async () => {
    const { getByText, waitForPreparation } = mount();
    await waitForPreparation();

    fireEvent.click(getByText("Back"));
    expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
  });

  it("renders the preparing upgrade message", async () => {
    const { queryByText, waitForPreparation } = mount();

    expect(queryByText(UpgradePageExplanation.Preparing)).toBeInTheDocument();

    await waitForPreparation();
  });

  it("renders the preparing upgrade spinner", async () => {
    const { container: upgradePage, waitForPreparation } = mount();

    expect(querySpinner(upgradePage)).toBeInTheDocument();

    await waitForPreparation();
  });

  it("does not render skip button while preparing", async () => {
    const { queryByText, waitForPreparation } = mount();

    expect(queryByText("Skip")).not.toBeInTheDocument();

    await waitForPreparation();
  });

  it("renders the upgrade is prepared message when prepared", async () => {
    const { waitForPreparation } = mount();
    await waitForPreparation();
  });

  it("stops rendering the preparing upgrade spinner when prepared", async () => {
    const { container: upgradePage, waitForPreparation } = mount();

    await waitForPreparation();

    expect(querySpinner(upgradePage)).not.toBeInTheDocument();
  });

  it("Upgrade button is enabled when prepared", async () => {
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
        requiredBurn: false,
        latestOSVersion: "",
        update: false,
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("renders the 'shouldBurn' message", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText(OsBurnExplanation.ShouldBurn));
      await waitForElement(() => getByText(OsBurnExplanation.ShouldBurnRecommendation));
    });


    it("doesn't render the 'requiredBurn' message", async () => {
      const { queryByText } = mount();
      await wait();

      expect(queryByText(OsBurnExplanation.RequiredBurn)).not.toBeInTheDocument();
      expect(queryByText(OsBurnExplanation.RequiredBurnRecommendation)).not.toBeInTheDocument();
    });
  })

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
        requiredBurn: true,
        latestOSVersion: "",
        update: false,
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("renders the 'requiredBurn' message", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText(OsBurnExplanation.RequiredBurn));
      await waitForElement(() => getByText(OsBurnExplanation.RequiredBurnRecommendation));
    });


    it("doesn't render the 'shouldBurn' message", async () => {
      const { queryByText } = mount();
      await wait();

      expect(queryByText(OsBurnExplanation.ShouldBurn)).not.toBeInTheDocument();
      expect(queryByText(OsBurnExplanation.ShouldBurnRecommendation)).not.toBeInTheDocument();
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

    it("doesn't render the 'requiredBurn' message", async () => {
      const { queryByText } = mount();
      await wait();

      expect(queryByText(OsBurnExplanation.RequiredBurn)).not.toBeInTheDocument();
      expect(queryByText(OsBurnExplanation.RequiredBurnRecommendation)).not.toBeInTheDocument();
    });


    it("doesn't render the 'shouldBurn' message", async () => {
      const { queryByText } = mount();
      await wait();

      expect(queryByText(OsBurnExplanation.ShouldBurn)).not.toBeInTheDocument();
      expect(queryByText(OsBurnExplanation.ShouldBurnRecommendation)).not.toBeInTheDocument();
    });
  })

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

    it("doesn't render the spinner", async () => {
      const { container: upgradePage, getByText } = mount();
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      expect(querySpinner(upgradePage)).not.toBeInTheDocument();
    });

    it("doesn't render the explanation message", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() => getByText(ErrorMessage.GenericError));

      expect(
        queryByText(UpgradePageExplanation.Preparing)
      ).not.toBeInTheDocument();
    });

    it("skip button exists", async () => {
      const { getByText } = mount();
      await wait();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  });

  describe("when the upgrade is being installed", () => {
    it("renders the upgrade is in progress message", async () => {
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
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      await waitForElement(() => upgradePage.querySelector(".progress"));
      const progressBar = upgradePage.querySelector(".progress");
      expect(progressBar).toMatchSnapshot();
    });

    it("renders the received message", async () => {
      const { getByText, waitForPreparation, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      expect(
        queryByText(Messages.UpgradeStatus.payload.message)
      ).toBeInTheDocument();
    });

    it("Upgrade button is disabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Back button is disabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForElement(() => getByText(UpgradePageExplanation.InProgress));

      await waitForElement(() => getByText("Back"));
      expect(getByText("Back")).toHaveProperty("disabled", true);
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

    it("doesn't render the explanation message", async () => {
      const { getByText, waitForPreparation, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      expect(
        queryByText(UpgradePageExplanation.Preparing)
      ).not.toBeInTheDocument();
    });

    it("Back button is enabled", async () => {
      const { getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForElement(() => getByText(ErrorMessage.GenericError));
      expect(getByText("Back")).toHaveProperty("disabled", false);
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

    it("renders the received message", async () => {
      const { getByText, waitForPreparation, waitForUpgradeFinish } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForUpgradeFinish();

      expect(
        getByText(Messages.UpgradeFinish.payload.message)
      ).toBeInTheDocument();
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
    });
  });

  describe("on upgrade error", () => {
    beforeEach(() => {
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

    it("skip button exists", async () => {
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
  });

  describe("when there's not enough space left on device", () => {
    beforeEach(async () => {
      getAvailableSpaceMock.mockResolvedValue(
        Messages.Size.payload.size.requiredSpace +
          Messages.Size.payload.size.downloadSize -
          1000
      );
    });

    it("renders the error message", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });
  });

  describe("when unable to get available space", () => {
    beforeEach(async () => {
      getAvailableSpaceMock.mockRejectedValue(
        new Error("nah mate couldn't tell ya")
      );
    });

    it("renders the error message", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText(ErrorMessage.GenericError));
    });
  });
});
