import React, { ReactNode } from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  wait,
  fireEvent,
  GetByBoundAttribute,
  AllByBoundAttribute,
  QueryByBoundAttribute,
  waitForElement,
  AllByText,
  within,
} from "@testing-library/react";
import ReactDom from "react-dom";

import WifiPageContainer, { Props } from "../WifiPageContainer";
import { ErrorMessage, ExplanationMessage } from "../WifiPage";

import { Network, NetworkCredentials } from "../../../types/Network";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import querySpinner from "../../../../test/helpers/querySpinner";
import { KeyCode } from "../../../../test/types/Keys";
import getNetworks from "../../../services/getNetworks";
import isConnectedToNetwork from "../../../services/isConnectedToNetwork";
import connectToNetwork from "../../../services/connectToNetwork";

jest.mock("../../../services/getNetworks");
jest.mock("../../../services/isConnectedToNetwork");
jest.mock("../../../services/connectToNetwork");

const getNetworksMock = getNetworks as jest.Mock;
const isConnectedToNetworkMock = isConnectedToNetwork as jest.Mock;
const connectToNetworkMock = connectToNetwork as jest.Mock;

const originalCreatePortal = ReactDom.createPortal;

describe("WifiPageContainer", () => {
  let defaultProps: Props;
  let wifiPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let getByText: BoundFunction<GetByText>;
  let getAllByText: BoundFunction<AllByText>;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  beforeEach(async () => {
    getNetworksMock.mockResolvedValue([]);
    isConnectedToNetworkMock.mockResolvedValue({ connected: false });
    connectToNetworkMock.mockImplementation(
      (creds: NetworkCredentials) =>
        new Promise((res, rej) => {
          if (
            creds.ssid === "unsecured-ssid" ||
            creds.password === "correct-password"
          ) {
            return res();
          }

          rej();
        })
    );

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element);

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      connectedNetwork: undefined,
      setConnectedNetwork: jest.fn(),
    };
  });
  afterEach(() => {
    getNetworksMock.mockRestore();
    isConnectedToNetworkMock.mockRestore();
    connectToNetworkMock.mockRestore();
    ReactDom.createPortal = originalCreatePortal;
  });

  it("disables the next button while loading", async () => {
    ({ getByText } = render(<WifiPageContainer {...defaultProps} />));

    expect(getByText("Next")).toBeDisabled();

    await wait();
  });

  it("renders spinner while loading", async () => {
    ({ container: wifiPageContainer } = render(
      <WifiPageContainer {...defaultProps} />
    ));

    expect(querySpinner(wifiPageContainer)).toBeInTheDocument();

    await wait();
  });

  it("renders correct message while loading", async () => {
    ({ queryByText } = render(<WifiPageContainer {...defaultProps} />));

    expect(queryByText("fetching networks...")).toBeInTheDocument();

    await wait();
  });

  it("renders skip warning dialog when skip button pressed", () => {
    ({ getAllByText, getByTestId } = render(
      <WifiPageContainer {...defaultProps} />
    ));

    fireEvent.click(getAllByText("Skip")[0]);
    expect(getByTestId("skip-warning-dialog")).not.toHaveClass("hidden");
  });

  it('hides skip warning dialog when "Connect" button clicked', () => {
    ({ getAllByText, getByTestId } = render(
      <WifiPageContainer {...defaultProps} />
    ));

    fireEvent.click(getAllByText("Skip")[0]);
    expect(getByTestId("skip-warning-dialog")).not.toHaveClass("hidden");

    fireEvent.click(getByText("Connect"));
    expect(getByTestId("skip-warning-dialog")).toHaveClass("hidden");
  });

  it("skips to next page when warning dialog skip button clicked", () => {
    ({ getByTestId } = render(<WifiPageContainer {...defaultProps} />));

    fireEvent.click(
      within(getByTestId("skip-warning-dialog")).getByText("Skip")
    );

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });

  describe("when connected network is passed", () => {
    const network = {
      ssid: "password-protected-ssid",
      passwordRequired: true,
    };

    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        connectedNetwork: network,
      };
    });

    it("renders correct explanation", async () => {
      ({
        container: wifiPageContainer,
        getByText,
        queryByText,
      } = render(<WifiPageContainer {...defaultProps} />));
      await wait();
      expect(
        queryByText(ExplanationMessage.WiFiConnection)
      ).toBeInTheDocument();
    });
  });

  describe("when is connected to network", () => {
    beforeEach(async () => {
      isConnectedToNetworkMock.mockResolvedValue({ connected: true });
      ({
        container: wifiPageContainer,
        getByText,
        queryByText,
      } = render(<WifiPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders correct explanation", () => {
      expect(
        queryByText(ExplanationMessage.WiredConnection)
      ).toBeInTheDocument();
    });
  });

  describe("when not connected to network", () => {
    beforeEach(async () => {
      isConnectedToNetworkMock.mockResolvedValue({ connected: false });
      ({
        container: wifiPageContainer,
        queryByText,
        getByText,
      } = render(<WifiPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders correct explanation", () => {
      expect(queryByText(ExplanationMessage.NotConnected)).toBeInTheDocument();
    });
  });

  describe("when unable to determine if connected to network", () => {
    beforeEach(async () => {
      isConnectedToNetworkMock.mockRejectedValue(
        new Error("unable to determine connection status")
      );

      ({
        container: wifiPageContainer,
        queryByText,
        getByText,
      } = render(<WifiPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders correct explanation", () => {
      expect(queryByText(ExplanationMessage.NotConnected)).toBeInTheDocument();
    });
  });

  describe("when unable to get networks", () => {
    beforeEach(async () => {
      getNetworksMock.mockRejectedValue(new Error("unable to get networks"));

      ({
        container: wifiPageContainer,
        queryByText,
        getByText,
        getByAltText,
        getByTestId,
        getAllByText,
      } = render(<WifiPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders error message", () => {
      expect(queryByText(ErrorMessage.FetchNetworks)).toBeInTheDocument();
    });

    describe("on refreshing networks", () => {
      let networks: Network[];
      beforeEach(() => {
        networks = [
          {
            ssid: "network-found-on-refresh-ssid",
            passwordRequired: true,
          },
        ];

        getNetworksMock.mockResolvedValueOnce(networks);
      });

      it("renders correct loading message", async () => {
        fireEvent.click(getByAltText("refresh-button"));

        expect(queryByText("fetching networks...")).toBeInTheDocument();

        await wait();
      });

      it("renders correct message while loading", async () => {
        fireEvent.click(getByAltText("refresh-button"));

        expect(queryByText("fetching networks...")).toBeInTheDocument();

        await wait();
      });

      it("renders new select options when loaded", async () => {
        fireEvent.click(getByAltText("refresh-button"));

        await wait();

        fireEvent.keyDown(queryReactSelect(wifiPageContainer)!, {
          keyCode: KeyCode.DownArrow,
        });

        networks.forEach(({ ssid }) => {
          expect(queryByText(ssid)).toBeInTheDocument();
        });
      });
    });
  });

  describe("when networks are loaded successfully", () => {
    let networks: Network[];

    beforeEach(async () => {
      networks = [
        {
          ssid: "password-protected-ssid",
          passwordRequired: true,
        },
        {
          ssid: "unsecured-ssid",
          passwordRequired: false,
        },
      ];

      getNetworksMock.mockResolvedValue(networks);

      ({
        container: wifiPageContainer,
        queryByText,
        getByText,
        getByTestId,
        getByLabelText,
      } = render(<WifiPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders correct select options", () => {
      fireEvent.keyDown(queryReactSelect(wifiPageContainer)!, {
        keyCode: KeyCode.DownArrow,
      });

      networks.forEach(({ ssid }) => {
        expect(queryByText(ssid)).toBeInTheDocument();
      });
    });

    describe("when option with password is selected", () => {
      let network: Network;
      beforeEach(() => {
        // open the select
        fireEvent.keyDown(queryReactSelect(wifiPageContainer)!, {
          keyCode: KeyCode.DownArrow,
        });

        network = networks.find(({ passwordRequired }) => passwordRequired)!;

        // click the wifi option
        fireEvent.click(getByText(network.ssid));
      });

      it("shows the connect dialog", () => {
        expect(getByTestId("connect-dialog")).not.toHaveClass("hidden");
      });

      it("renders dialog message correctly", () => {
        expect(
          within(getByTestId("connect-dialog")).queryByTestId("dialog-message")
        ).toMatchSnapshot();
      });

      it("renders error when incorrect password is used", async () => {
        const passwordInputLabel = getByLabelText("Enter password below");
        fireEvent.change(passwordInputLabel, {
          target: { value: "incorrect-password" },
        });
        fireEvent.click(getByText("Join"));
        await waitForElement(() =>
          getByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        );
      });

      it("clears error when cancel is clicked", async () => {
        const passwordInputLabel = getByLabelText("Enter password below");
        fireEvent.change(passwordInputLabel, {
          target: { value: "incorrect-password" },
        });
        fireEvent.click(getByText("Join"));
        await waitForElement(() =>
          getByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        );
        fireEvent.click(getByText("Cancel"));
        fireEvent.keyDown(queryReactSelect(wifiPageContainer)!, {
          keyCode: KeyCode.DownArrow,
        });
        fireEvent.click(getByText(network.ssid));

        expect(
          queryByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        ).not.toBeInTheDocument();
      });

      it("clears error when retry is clicked", async () => {
        const passwordInputLabel = getByLabelText("Enter password below");
        fireEvent.change(passwordInputLabel, {
          target: { value: "incorrect-password" },
        });
        fireEvent.click(getByText("Join"));
        await waitForElement(() =>
          getByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        );
        fireEvent.click(getByText("Retry"));

        expect(
          queryByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        ).not.toBeInTheDocument();
        waitForElement(() =>
          getByText(
            `There was an error connecting to ${network.ssid}... please check your password and try again`
          )
        );
      });

      describe("on cancel click", () => {
        beforeEach(() => {
          fireEvent.click(getByText("Cancel"));
        });

        it("hides the connect dialog on cancel click", () => {
          expect(getByTestId("connect-dialog")).toHaveClass("hidden");
        });

        it("resets selected network", () => {
          expect(queryByText(network.ssid)).not.toBeInTheDocument();
        });
      });
    });
  });
});
