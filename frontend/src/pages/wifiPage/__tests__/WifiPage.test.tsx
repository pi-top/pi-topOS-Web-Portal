import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  RenderResult,
  QueryByBoundAttribute,
} from "@testing-library/react";
import { AllByText, wait } from "@testing-library/dom";

import WifiPage, { Props, ErrorMessage, ExplanationMessage } from "../WifiPage";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import reactSelectIsDisabled from "../../../../test/helpers/reactSelectIsDisabled";
import { KeyCode } from "../../../../test/types/Keys";
import { Network } from '../../../types/Network';
import querySpinner from "../../../../test/helpers/querySpinner";
import connectToNetwork from "../../../services/connectToNetwork";

jest.mock("../../../services/connectToNetwork");
const connectToNetworkMock = connectToNetwork as jest.Mock;

describe("WifiPage", () => {
  let defaultProps: Props;
  let wifiPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryAllByText: BoundFunction<AllByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let queryByAltText: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
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
      isCompleted: false,
    };

    connectToNetworkMock.mockResolvedValue('OK')

    ({
      container: wifiPage,
      getByAltText,
      queryByText,
      queryAllByText,
      queryByTestId,
      queryByAltText,
      queryByLabelText,
      getByLabelText,
      getByText,
      rerender,
    } = render(<WifiPage {...defaultProps} />));
  });
  afterEach(() => {
    connectToNetworkMock.mockRestore();
  })

  it("renders the correct banner image", () => {
    expect(queryByAltText("wifi-page-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = wifiPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("Next button is disabled on no internet", () => {
    expect(getByText("Next")).toHaveProperty("disabled");
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

  it("renders the dialog", () => {
    expect(queryByTestId("dialog")).toBeInTheDocument();
  });

  it("hides the connect dialog", () => {
    expect(queryByTestId("dialog")).toHaveClass("hidden");
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

    it("skip button exists", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
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

    it("skip button is present", () => {
      expect(getByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
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
        expect(queryByTestId("dialog")).not.toHaveClass("hidden");
      });

      it("renders dialog message correctly", () => {
        expect(queryByTestId("dialog-message")).toMatchSnapshot();
      });

      describe("on cancel click", () => {
        beforeEach(() => {
          fireEvent.click(getByText("Cancel"));
        });

        it("hides the dialog", () => {
          expect(queryByTestId("dialog")).toHaveClass("hidden");
        });

        it("resets selected network", () => {
          expect(queryByText(network.ssid)).not.toBeInTheDocument();
        });
      });

      describe('when finished connecting to network', () => {
        beforeEach(async () => {
          fireEvent.click(getByText('Join'));

          await wait();
        });

        it('hides the connect dialog on OK click', () => {
          fireEvent.click(getByText('OK'));

          expect(queryByTestId("dialog")).toHaveClass("hidden");
        })
      })
    });
  });
});
