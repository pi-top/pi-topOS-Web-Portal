import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  GetAllByText,
  QueryByText,
  GetByText,
  RenderResult,
  QueryByBoundAttribute,
  within,
} from "@testing-library/react";
import { AllByText } from "@testing-library/dom";

import WifiPage, { Props, ErrorMessage, ExplanationMessage } from "../WifiPage";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import reactSelectIsDisabled from "../../../../test/helpers/reactSelectIsDisabled";
import { KeyCode } from "../../../../test/types/Keys";
import { Network, NetworkCredentials } from "../../../types/Network";
import { WifiConnectionInfo } from "../../../types/WifiConnectionInfo";
import querySpinner from "../../../../test/helpers/querySpinner";
import connectToNetwork from "../../../services/connectToNetwork";
import wifiConnectionInformation from "../../../services/wifiConnectionInformation";
import { waitFor } from "../../../../test/helpers/waitFor";

jest.mock("../../../services/connectToNetwork");
jest.mock("../../../services/wifiConnectionInformation");

const connectToNetworkMock = connectToNetwork as jest.Mock;
const wifiConnectionInformationMock = wifiConnectionInformation as jest.Mock;

describe("WifiPage", () => {
  let defaultProps: Props;
  let wifiPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryAllByText: BoundFunction<AllByText>;
  let getAllByText: GetAllByText;
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  let queryByAltText: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  let wifiInfo: WifiConnectionInfo;

  beforeEach(() => {
    defaultProps = {
      networks: [],
      onNextClick: jest.fn(),
      onSkipClick: jest.fn(),
      onBackClick: jest.fn(),
      onRefreshClick: jest.fn(),
      setConnectedNetwork: jest.fn(),
      isFetchingNetworks: false,
      fetchNetworksError: false,
      isConnected: false,
      onAdvancedConfigurationDialogOpen: jest.fn(),
      onAdvancedConfigurationDialogClose: jest.fn(),
      advancedConfigUrl: "",
      advancedConfigError: false,
    };

    wifiInfo = {
      ssid: "",
      bssid: "",
      bssidsForSsid: [],
    }
    wifiConnectionInformationMock.mockImplementation(() => Promise.resolve(wifiInfo))
    connectToNetworkMock.mockImplementation(
      (creds: NetworkCredentials) =>
        new Promise((res, rej) => {
          if (
            creds.bssid === "unsecured-bssid" ||
            creds.password === "correct-password"
          ) {
            wifiInfo = {
              ssid: creds.bssid,
              bssid: creds.bssid,
              bssidsForSsid: [creds.bssid],
            }
            return res(void 0);
          }
          wifiInfo = {
            ssid: "",
            bssid: "",
            bssidsForSsid: [],
          };
          rej();
        })
    );

    ({
      container: wifiPage,
      getByAltText,
      queryByText,
      queryAllByText,
      queryByAltText,
      queryByLabelText,
      getAllByText,
      getByLabelText,
      getByTestId,
      getByText,
      rerender,
    } = render(<WifiPage {...defaultProps} />))
  });
  afterEach(() => {
  });

  it("renders the correct banner image", () => {
    expect(queryByAltText("wifi-page-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = wifiPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("Next button is disabled on no internet", () => {
    expect(getByText("Next").parentElement).toHaveProperty("disabled");
  });

  it("renders skip button", () => {
    expect(queryAllByText("Skip")).toHaveLength(2);
  });

  it("calls onBackClick when back button clicked", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it("calls onRefreshClick when refresh button clicked", () => {
    fireEvent.click(getByAltText("refresh-button"));

    expect(defaultProps.onRefreshClick).toHaveBeenCalled();
  });

  it("renders select", () => {
    expect(queryReactSelect(wifiPage)).toBeInTheDocument();
  });

  it("renders correct placeholder in select", () => {
    expect(getByText("Please select WiFi network...")).toBeInTheDocument();
  });

  it("renders refresh networks button", () => {
    expect(queryByAltText("refresh-button")).toBeInTheDocument();
  });

  it("doesn't render the fetching networks message", () => {
    expect(queryByText("fetching networks...")).not.toBeInTheDocument();
  });

  it("doesn't render the fetching networks spinner", () => {
    expect(querySpinner(wifiPage)).not.toBeInTheDocument();
  });

  it("renders a hidden connect dialog", () => {
    expect(getByTestId("connect-dialog")).toHaveClass("hidden");
  });

  it("renders a hidden skip warning dialog", () => {
    expect(getByTestId("skip-warning-dialog")).toHaveClass("hidden");
  });

  it("renders a hidden advanced configuration dialog", () => {
    expect(getByTestId("advanced-config-dialog")).toHaveClass("hidden");
  });

  it("renders skip warning dialog when skip button pressed", () => {
    fireEvent.click(getAllByText("Skip")[0]);
    expect(getByTestId("skip-warning-dialog")).not.toHaveClass("hidden");
  });

  it('hides skip warning dialog when "Connect" button clicked', () => {
    fireEvent.click(getAllByText("Skip")[0]);
    expect(getByTestId("skip-warning-dialog")).not.toHaveClass("hidden");

    fireEvent.click(getByText("Connect"));
    expect(getByTestId("skip-warning-dialog")).toHaveClass("hidden");
  });

  it("skips to next page when warning dialog skip button clicked", () => {
    fireEvent.click(
      within(getByTestId("skip-warning-dialog")).getByText("Skip")
    );

    expect(defaultProps.onSkipClick).toHaveBeenCalled();
  });

  it("renders advanced configuration dialog when 'advanced configuration' button pressed", () => {
    fireEvent.click(getByText("Advanced Configuration"));
    expect(getByTestId("advanced-config-dialog")).not.toHaveClass("hidden");
  });

  it("hides advanced configuration dialog when 'close' button clicked", () => {
    fireEvent.click(getByText("Advanced Configuration"));
    expect(getByTestId("advanced-config-dialog")).not.toHaveClass("hidden");

    fireEvent.click(getByText("Close"));
    expect(getByTestId("advanced-config-dialog")).toHaveClass("hidden");
  });

  describe("when entering page with an internet connection", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isConnected: true,
      };

      rerender(<WifiPage {...defaultProps} />);
    });

    it("renders a text saying that the user is already connected", () => {
      expect(
        queryByText(ExplanationMessage.WiredConnection)
      ).toBeInTheDocument();
    });

    it("calls onNextClick when next button clicked", () => {
      fireEvent.click(getByText("Next"));

      expect(defaultProps.onNextClick).toHaveBeenCalled();
    });
  });

  describe("when entering page without an internet connection", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isConnected: false,
      };

      rerender(<WifiPage {...defaultProps} />);
    });

    it("renders the explanation", () => {
      expect(queryByText(ExplanationMessage.NotConnected)).toBeInTheDocument();
    });
  });

  describe("when is fetching networks", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isFetchingNetworks: true,
      };

      rerender(<WifiPage {...defaultProps} />);
    });

    it("renders the fetching networks message", () => {
      expect(queryByText("fetching networks...")).toBeInTheDocument();
    });

    it("renders the fetching networks spinner", () => {
      expect(querySpinner(wifiPage)).toBeInTheDocument();
    });

    it("the networks select is disabled", () => {
      expect(reactSelectIsDisabled(wifiPage)).toEqual(true);
    });

    it("does not render refresh networks button", () => {
      expect(queryByAltText("refresh-button")).not.toBeInTheDocument();
    });
  });

  describe("when fetchNetworkError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        fetchNetworksError: true,
      };

      rerender(<WifiPage {...defaultProps} />);
    });

    it("renders error message", () => {
      expect(queryByText(ErrorMessage.FetchNetworks)).toBeInTheDocument();
    });
  });

  describe("when networks are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        networks: [
          {
            ssid: "password-protected-ssid",
            bssid: "password-protected-bssid",
            passwordRequired: true,
          },
          {
            ssid: "unsecured-ssid",
            bssid: "unsecured-bssid",
            passwordRequired: false,
          },
        ],
      };

      rerender(<WifiPage {...defaultProps} />);
    });

    it("renders correct select options", () => {
      fireEvent.keyDown(queryReactSelect(wifiPage)!, {
        keyCode: KeyCode.DownArrow,
      });

      defaultProps.networks.forEach(({ ssid }) => {
        expect(queryByText(ssid)).toBeInTheDocument();
      });
    });

    it("allows selecting option", () => {
      const {
        networks: [firstNetwork, ...remainingNetworks],
      } = defaultProps;

      // open the select
      fireEvent.keyDown(queryReactSelect(wifiPage)!, {
        keyCode: KeyCode.DownArrow,
      });

      // click the wifi option
      fireEvent.click(getByText(firstNetwork.ssid));

      /*
        the menu closes and the selected option should still be rendered
        but the second option should not be rendered as the menu is closed
      */
      expect(queryAllByText(firstNetwork.ssid).length).toBeGreaterThan(0);
      remainingNetworks.forEach(({ ssid }) => {
        expect(queryByText(ssid)).not.toBeInTheDocument();
      });
    });

    describe("when option without a password is selected", () => {
      let network: Network;
      beforeEach(() => {
        // open the select
        fireEvent.keyDown(queryReactSelect(wifiPage)!, {
          keyCode: KeyCode.DownArrow,
        });

        network = defaultProps.networks.find(
          ({ passwordRequired }) => !passwordRequired
        )!;

        // click the wifi option
        fireEvent.click(getByText(network.ssid));
      });

      it("shows the connect dialog", () => {
        expect(getByTestId("connect-dialog")).not.toHaveClass("hidden");
      });

      it("renders dialog message correctly", () => {
        expect(
          within(getByTestId("connect-dialog")).getByTestId("dialog-message")
        ).toMatchSnapshot();
      });

      describe("on cancel click", () => {
        beforeEach(() => {
          fireEvent.click(getByText("Cancel"));
        });

        it("hides the dialog", () => {
          expect(getByTestId("connect-dialog")).toHaveClass("hidden");
        });

        it("resets selected network", () => {
          expect(queryByText(network.ssid)).not.toBeInTheDocument();
        });
      });

      describe("when finished connecting to network", () => {
        beforeEach(() => {
          fireEvent.click(getByText("Join"));
        });

        it("hides the connect dialog on OK click", async () => {
          await waitFor(() => expect(getByText("OK")).toBeInTheDocument());
          fireEvent.click(getByText("OK"));

          waitFor(() => expect(getByTestId("connect-dialog")).toHaveClass("hidden"));
        });
      });
    });
  });
});
