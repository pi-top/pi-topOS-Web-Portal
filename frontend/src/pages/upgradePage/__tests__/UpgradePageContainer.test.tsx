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
  waitForGenericError: () => any,
  waitForInstallingPackages: () => any,
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


Object.defineProperty(window, "location", {
  writable: true,
  value: { replace: jest.fn() }
} );


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
        waitForGenericError: async () => {
          await Promise.all(ErrorMessage.GenericError
            .split("\n").map(async (text, _): Promise<any> => {
            text && await waitForElement(() => result.getByText(text))
          }))
        },
        waitForInstallingPackages: async () => {
          await Promise.all(UpgradePageExplanation.InProgress
            .split("\n").map(async (text, _): Promise<any> => {
            text && await waitForElement(() => result.getByText(text))
          }))
        },
      };
    };
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it("Update button is disabled", async () => {
    const { getByText } = mount();

    expect(getByText("Update")).toHaveProperty("disabled", true);
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
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources))

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the 'updating sources' message", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

      expect(getByText(UpgradePageExplanation.UpdatingSources)).toBeInTheDocument();
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

    it("Update button is disabled", async () => {
      const { getByText } = mount();

      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Back button isn't present", async () => {
      const { queryByText } = mount();

      expect(queryByText("Back")).not.toBeInTheDocument();
    });

  });

  describe("when sources are updated", () => {
    describe("and there are updates to the web-portal package", () => {
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
          });
        });
      });

      it("renders prompt correctly", async () => {
        const { getByText, container: upgradePage } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

        const prompt = upgradePage.querySelector(".prompt");
        expect(prompt).toMatchSnapshot();
      });

      it("renders the 'preparing your system to be updated' message", async () => {
        const { getByText } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))
      });

      it("renders the textarea component", async () => {
        const { getByText, container: upgradePage } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

        const textAreaElement = upgradePage.querySelector(".textarea");
        expect(textAreaElement).toBeInTheDocument()
      });

      it("textarea component displays web-portal upgrade messages", async () => {
        const { getByText, findByTestId, queryByTestId } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

        await findByTestId("textarea");
        const textAreaElement = queryByTestId("textarea");
        expect(textAreaElement).toMatchSnapshot();
      });

      it("Update button is disabled", async () => {
        const { getByText } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

        expect(getByText("Update")).toHaveProperty("disabled", true);
      });
    });

    describe("and there are no updates to the web-portal package", () => {
      beforeEach(async () => {
        let times = 0;
        server = createServer();
        server.on("connection", (socket) => {
          socket.on("message", (data) => {
            if (data === "update_sources") {
              socket.send(JSON.stringify(Messages.UpdateSourcesStart));
              socket.send(JSON.stringify(Messages.UpdateSourcesStatus));
              socket.send(JSON.stringify(Messages.UpdateSourcesFinish));
            }

            if (data === "prepare_web_portal" || data === "prepare") {
              if(times == 0) {
                socket.send(JSON.stringify(Messages.PrepareStart));
                socket.send(JSON.stringify(Messages.PrepareFinish));
                times = times + 1;
              } else {
                socket.send(JSON.stringify(Messages.PrepareStart));
              }
            }

            if (data === "size") {
              socket.send(JSON.stringify(Messages.NoSize));
            }
          });
        });
      });

      it("renders the 'checking size of update' message", async () => {
        const { getByText } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.Preparing))
      });

      it("doesn't render the textarea component", async () => {
        const { getByText, container: upgradePage } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.Preparing))

        const textAreaElement = upgradePage.querySelector(".textarea");
        expect(textAreaElement).not.toBeInTheDocument()
      });

      it("Update button is disabled", async () => {
        const { getByText } = mount();
        await waitForElement(() => getByText(UpgradePageExplanation.Preparing))

        expect(getByText("Update")).toHaveProperty("disabled", true);
      });
    });
  });

  describe("when updating sources fails", () => {
    beforeEach(async () => {
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      expect(getByText("Retry")).toHaveProperty("disabled", false);
    });


    describe("and the Retry button is pressed", () => {
      beforeEach(async () => {
        server = createServer();
        let times = 0;
        server.on("connection", (socket) => {
          socket.on("message", (data) => {
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

        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));
        expect(
          queryByText(UpgradePageExplanation.UpdatingSources)
        ).toBeInTheDocument();
      });


      it("renders prompt correctly", async () => {
        const { waitForGenericError, getByText, container: upgradePage } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        const prompt = upgradePage.querySelector(".prompt");
        expect(prompt).toMatchSnapshot();
      });

      it("doesn't render the error message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
      });

      it("renders the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        await findByTestId("textarea");
        expect(queryByTestId("textarea")).toBeInTheDocument();
      });

      it("messages are displayed in the textarea component", async () => {
        const { container: upgradePage, getByText, findByTestId, queryByTestId, waitForGenericError } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await wait();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        await findByTestId("textarea");
        await wait();
        const textAreaElement = queryByTestId("textarea");
        expect(textAreaElement).toMatchSnapshot();
      });

      it("doesn't render the 'preparing updates' message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        expect(
          queryByText(UpgradePageExplanation.Preparing)
        ).not.toBeInTheDocument();
      });

      it("Skip button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        expect(queryByText("Skip")).not.toBeInTheDocument();
      });

      it("Back button isn't rendered", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        expect(queryByText("Back")).not.toBeInTheDocument();
      });

      it("Update button is present", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        expect(queryByText("Update")).toBeInTheDocument();
      });

      it("Update button is disabled", async () => {
        const { waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        await waitForElement(() => getByText("Update"));
        expect(getByText("Update")).toHaveProperty("disabled", true);
      });
    })
  });

  describe("while updating web-portal", () => {
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
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the updating web-portal message", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))
    });

    it("renders the textarea component", async () => {
      const { getByText, queryByTestId } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    it("textarea component displays web-portal upgrade messages", async () => {
      const { getByText, findByTestId, queryByTestId } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

      await findByTestId("textarea");
      const textAreaElement = queryByTestId("textarea");
      expect(textAreaElement).toMatchSnapshot();
    });

    it("Update button is present", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

      expect(queryByText("Update")).toBeInTheDocument();
    });

    it("Update button is disabled", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal))

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Skip button is not present", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal));

      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

  });

  describe("when updating web-portal succeeds", () => {
    beforeEach(async () => {
      restartWebPortalServiceMock.mockResolvedValue("OK");
      serverStatusMock.mockResolvedValue("OK");

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

    it("renders prompt correctly", async () => {
      const { getByText, container: upgradePage } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      const prompt = upgradePage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders the 'please wait' message while restarting web-portal service", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))
    });

    it("Update button is present", async () => {
      const { getByText, queryByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      expect(queryByText("Update")).toBeInTheDocument();
    });

    it("Update button is disabled", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("requests to restart the pt-os-web-portal systemd service", async () => {
      const { getByText } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      expect(restartWebPortalServiceMock).toHaveBeenCalled();
    });

    it("doesn't display an error message when restartWebPortalService fails", async () => {
      // we expect restartWebPortalService to fail since the backend server restarts
      restartWebPortalServiceMock.mockRejectedValue(new Error("backend server restarted"));
      const { getByText, queryByText} = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))
      jest.useFakeTimers();
      jest.runOnlyPendingTimers();

      expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
    });

    it("renders a spinner while server is restarting", async () => {
      const { getByText, container: upgradePage} = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      expect(querySpinner(upgradePage)).toBeInTheDocument();
    });

    it("probes backend server to determine if its online", async () => {
      jest.useFakeTimers();
      const { getByText } = mount();
      jest.runAllTimers();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(serverStatusMock).toHaveBeenCalled();
    });

    it.skip("probes backend server until its online", async () => {
      serverStatusMock.mockRejectedValue(new Error("I'm offline, try again later"));
      jest.useFakeTimers();
      const { getByText } = mount();
      jest.runAllTimers();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))

      expect(serverStatusMock).not.toBeCalled();
      jest.runOnlyPendingTimers();

      // checks twice
      jest.runOnlyPendingTimers();
      expect(serverStatusMock).toHaveBeenCalledTimes(1);
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
      const { getByText, queryByTestId } = mount();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))
      jest.useFakeTimers();
      jest.runOnlyPendingTimers();

      expect(queryByTestId("textarea")).not.toBeInTheDocument();
    });

    it("refreshes window when server is restarted", async () => {
      jest.useFakeTimers();
      const { getByText } = mount();
      jest.runAllTimers();
      await waitForElement(() => getByText(UpgradePageExplanation.WaitingForServer))
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(window.location.replace).toHaveBeenCalled();
    });
  });

  describe("when updating web-portal fails", () => {
    beforeEach(async () => {
      server = createServer();
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      expect(getByText("Retry")).toHaveProperty("disabled", false);
    });

    it("renders the textarea component", async () => {
      const { waitForGenericError, queryByTestId } = mount();
      await waitForGenericError();

      expect(queryByTestId("textarea")).toBeInTheDocument();
    });

    describe("and the Retry button is pressed", () => {
      it("renders prompt correctly", async () => {
        const { waitForGenericError, getByText, container: upgradePage } = mount();
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

        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));
        expect(queryByText(UpgradePageExplanation.UpdatingSources)).toBeInTheDocument();
      });

      it("doesn't render the error message", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));
        expect(queryByText(ErrorMessage.GenericError)).not.toBeInTheDocument();
      });

      it("renders the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));

        await findByTestId("textarea");
        expect(queryByTestId("textarea")).toBeInTheDocument();
      });

      it("messages are displayed in the textarea component", async () => {
        const { waitForGenericError, getByText, findByTestId, queryByTestId } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));
        await wait();
        await waitForElement(() => getByText(UpgradePageExplanation.UpdatingSources));
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

      it("Update button is present", async () => {
        const { waitForGenericError, getByText, queryByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        expect(queryByText("Update")).toBeInTheDocument();
      });

      it("Update button is disabled", async () => {
        const { waitForGenericError, getByText } = mount();
        await waitForGenericError();
        await waitForElement(() => getByText("Retry"));
        fireEvent.click(getByText("Retry"));

        await waitForElement(() => getByText("Update"));
        expect(getByText("Update")).toHaveProperty("disabled", true);
      });
    })

  });

  // describe("when updating web-portal succeeds and there are system updates", () => {
  // describe("when updating web-portal succeeds and there are no system updates", () => {

  describe("when the system is being updated", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      const { getByText, waitForPreparation, waitForInstallingPackages } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await waitForInstallingPackages();
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

    it("Update button is disabled", async () => {
      const { getByText, waitForPreparation, waitForInstallingPackages } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForInstallingPackages();

      await waitForElement(() => getByText("Update"));
      expect(getByText("Update")).toHaveProperty("disabled", true);
    });

    it("Back button is not rendered", async () => {
      const { getByText, queryByText, waitForInstallingPackages, waitForPreparation } = mount();
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
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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

          if (data === "start") {
            socket.send(JSON.stringify(Messages.UpgradeStart));
            socket.send(JSON.stringify(Messages.UpgradeStatus));
            if (times == 1) {
              socket.send(JSON.stringify(Messages.UpgradeError));
              times = times + 1;
            }
          }
        });
      });
    });

    it("renders prompt correctly", async () => {
      const { waitForGenericError, container: upgradePage, getByText, waitForPreparation } = mount();
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
      const { getByText, waitForPreparation, queryByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));

      await Promise.all(UpgradePageExplanation.InProgress
        .split("\n").map(async (text, _): Promise<any> => {
        text && expect(queryByText(text)).not.toBeInTheDocument()
      }))
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
      const { waitForGenericError, queryByText, getByText, waitForPreparation } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForGenericError, queryByText, getByText, waitForPreparation } = mount();
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
      expect(getByText("Retry")).toHaveProperty("disabled", false);
    });

    it("restarts the update process when Retry button is pressed", async () => {
      const { waitForPreparation, waitForGenericError, getByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Update"));
      await waitForGenericError();
      await waitForElement(() => getByText("Retry"));
      fireEvent.click(getByText("Retry"));

      await waitForElement(() => getByText(UpgradePageExplanation.UpdatingWebPortal));
      expect(getByText(UpgradePageExplanation.UpdatingWebPortal)).toBeInTheDocument();
    });
  });

  describe("when the upgrade finishes", () => {
    beforeEach(() => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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

          if (data === "start") {
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
    });

    it("renders prompt correctly", async () => {
      const { container: upgradePage, getByText, waitForPreparation, waitForUpgradeFinish } = mount();
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
      expect(restartWebPortalServiceMock).not.toHaveBeenCalled();
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
        let times = 0;
        socket.on("message", (data) => {
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
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { getByText } = mount();

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button is disabled", async () => {
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
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      const { waitForGenericError, getByText } = mount();

      await waitForGenericError()
    });

    it("Skip button exists", async () => {
      const { waitForGenericError, getByText } = mount();
      await waitForGenericError()

      await waitForElement(() => getByText("Skip"));
    });

    it("calls goToNextPage when Skip button clicked", async () => {
      const { waitForGenericError, getByText } = mount();
      await waitForGenericError()

      await waitForElement(() => getByText("Skip"));
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("Update button isn't present", async () => {
      const { waitForGenericError, queryByText } = mount();
      await waitForGenericError()

      expect(queryByText("Update")).not.toBeInTheDocument();
    });

    it("Retry button is present", async () => {
      const { waitForGenericError, queryByText, getByText } = mount();
      await waitForGenericError()

      expect(queryByText("Retry")).toBeInTheDocument();
      expect(getByText("Retry")).toHaveProperty("disabled", false);
    });
  });

  describe("when there are major OS updates available and user 'shouldBurn'", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { queryByTestId, waitForPreparation } = mount();
      await waitForPreparation();

      expect(queryByTestId("dialog")).not.toHaveClass("hidden");
    });

    it("hides the dialog on Close click", async() => {
      const { queryByTestId, waitForPreparation, getByText } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Close"));

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });

    it("renders the correct message", async () => {
      const { waitForPreparation, queryByTestId } = mount();
      await waitForPreparation();

      expect(queryByTestId("dialog")).toMatchSnapshot();
    });

  })

  describe("when there are major OS updates available and user 'requireBurn'", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
      }
      serverStatusMock.mockResolvedValue("OK");
      restartWebPortalServiceMock.mockResolvedValue("OK");
      getMajorOsUpdatesMock.mockResolvedValue(osUpdatesResponse);
    });

    it("shows the OS version update dialog", async () => {
      const { waitForPreparation, queryByTestId } = mount();
      await waitForPreparation();

      expect(queryByTestId("dialog")).not.toHaveClass("hidden");
    });

    it("hides the dialog on Close click", async() => {
      const { waitForPreparation, getByText, queryByTestId } = mount();
      await waitForPreparation();
      fireEvent.click(getByText("Close"));

      expect(queryByTestId("dialog")).toHaveClass("hidden");
    });

    it("renders the correct message", async () => {
      const { waitForPreparation, queryByTestId } = mount();
      await waitForPreparation();

      expect(queryByTestId("dialog")).toMatchSnapshot();
    });
  })

  describe("when checking for major OS updates fails", () => {
    beforeEach(async () => {
      let times = 0;
      server = createServer();
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
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
