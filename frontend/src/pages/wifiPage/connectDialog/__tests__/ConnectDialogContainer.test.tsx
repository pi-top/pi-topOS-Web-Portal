import React, { ReactNode } from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  wait,
  fireEvent,
  GetByBoundAttribute,
  RenderResult,
  within,
  screen,
} from "@testing-library/react";
import ReactDom from "react-dom";

import ConnectDialogContainer, { Props } from "../ConnectDialogContainer";

import { NetworkCredentials } from "../../../../types/Network";
import querySpinner from "../../../../../test/helpers/querySpinner";
import connectToNetwork from "../../../../services/connectToNetwork";
import isConnectedThroughAp from "../../../../services/isConnectedThroughAp";
import wifiConnectionInformation from "../../../../services/wifiConnectionInformation";
import { waitFor } from "../../../../../test/helpers/waitFor";
import { WifiConnectionInfo } from "../../../../types/WifiConnectionInfo";

jest.mock("../../../../services/connectToNetwork");
jest.mock("../../../../services/isConnectedThroughAp");
jest.mock("../../../../services/wifiConnectionInformation");

const connectToNetworkMock = connectToNetwork as jest.Mock;
const isConnectedThroughApMock = isConnectedThroughAp as jest.Mock;
const wifiConnectionInformationMock = wifiConnectionInformation as jest.Mock;
const originalCreatePortal = ReactDom.createPortal;

describe("ConnectDialogContainer", () => {
  let defaultProps: Props;
  let connectDialogContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  let wifiInfo: WifiConnectionInfo = {
    ssid: "",
    bssid: "",
    bssidsForSsid: [],
  };
  const setWifiInfo = (ssid: string, bssid: string, bssidsForSsid: string[]) => {
    wifiInfo.ssid = ssid;
    wifiInfo.bssid = bssid;
    wifiInfo.bssidsForSsid = bssidsForSsid;
  }

  beforeEach(async () => {
    isConnectedThroughApMock.mockResolvedValue({ isUsingAp: false })

    wifiConnectionInformationMock.mockImplementation(() => {
      return Promise.resolve(wifiInfo);
    });

    connectToNetworkMock.mockImplementation(
      (creds: NetworkCredentials) =>
        new Promise((res, rej) => {
          if (
            creds.bssid === "unsecured-bssid" ||
            creds.password === "correct-password"
          ) {
            setWifiInfo("", creds.bssid, [creds.bssid]);
            return res(void 0);
          }
          setWifiInfo("", "", []);
          rej();
        })
    );

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element);

    defaultProps = {
      active: true,
      network: {
        ssid: "unsecured-ssid",
        bssid: "unsecured-bssid",
        passwordRequired: false,
      },
      onCancel: jest.fn(),
      onDone: jest.fn(),
      setConnectedNetwork: jest.fn(),
    };

    ({
      container: connectDialogContainer,
      queryByText,
      getByText,
      getByLabelText,
      rerender,
    } = render(<ConnectDialogContainer {...defaultProps} />));
  });

  afterEach(() => {
    connectToNetworkMock.mockRestore();
    ReactDom.createPortal = originalCreatePortal;
  });

  it("calls onCancel correctly on cancel button click", () => {
    fireEvent.click(getByText("Cancel"));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("renders spinner on join click", async () => {
    fireEvent.click(getByText("Join"));

    expect(querySpinner(connectDialogContainer)).toBeInTheDocument();

    await wait();
  });

  it("renders connected message after joining successfully", async () => {
    fireEvent.click(getByText("Join"));
    await waitFor(() => {
      const message = screen.getByText(/Great, your pi-top is connected to/)
      expect(within(message).getByText(defaultProps!.network!.ssid)).toBeInTheDocument()
    });
  });

  describe("when there's an error connecting to a network", ()  => {
    beforeEach(async () => {

      const props = {
        ...defaultProps,
        network: {
          ssid: "invalid-ssid",
          bssid: "invalid-bssid",
          passwordRequired: false,
        },
      }

      rerender(<ConnectDialogContainer {...props} />);
      jest.useFakeTimers();
      fireEvent.click(getByText("Join"));
      jest.advanceTimersByTime(35_000);
      jest.useRealTimers();
    })

    it("renders an error message", async () => {
      await waitFor(() => expect(
        getByText(
          "There was an error connecting to invalid-ssid... please check your password and try again"
        )
      ).toBeInTheDocument());
    });

    it("doesn't tell user to reconnect to AP", async () => {
      expect(
        queryByText(
          "Your computer has disconnected from the wifi network 'pi-top'. Please reconnect to it."
        )
      ).not.toBeInTheDocument();
    });
  });

  describe("when network with password is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        network: {
          ssid: "password-protected-ssid",
          bssid: "password-protected-bssid",
          passwordRequired: true,
        },
      };

      rerender(<ConnectDialogContainer {...defaultProps} />);
    });

    it("renders spinner on join click", async () => {
      fireEvent.click(getByText("Join"));

      expect(querySpinner(connectDialogContainer)).toBeInTheDocument();

      await wait();
    });

    describe("after joining successfully", () => {
      beforeEach(async () => {
        fireEvent.change(getByLabelText("Enter password below"), {
          target: {
            value: "correct-password",
          },
        });

        fireEvent.click(getByText("Join"));

        await wait();
      });

      it("renders connected message", async () => {
        await waitFor(() => {
          const message = screen.getByText(/Great, your pi-top is connected to/)
          expect(within(message).getByText(defaultProps!.network!.ssid)).toBeInTheDocument()
        });
      });

      describe("when new network is passed", () => {
        beforeEach(() => {
          defaultProps = {
            ...defaultProps,
            network: {
              ssid: "new-network",
              bssid: "new-network-bssid",
              passwordRequired: true,
            },
          };

          rerender(<ConnectDialogContainer {...defaultProps} />);
        });

        it("does not render connected message", () => {
          expect(
            queryByText("Great, you are connected!")
          ).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when user is onboarding using AP mode", () => {
    beforeEach(() => {
      isConnectedThroughApMock.mockResolvedValue({ isUsingAp: true })
    });

    describe("and the connect-to-wifi request times outs", () => {
      beforeEach(async () => {
        connectToNetworkMock.mockRejectedValue(new Error(`Timeout`));
        setWifiInfo("", "", []);

        defaultProps = {
          ...defaultProps,
          network: {
            ssid: "unsecured-ssid",
            bssid: "unsecured-bssid",
            passwordRequired: false,
          },
        };

        rerender(<ConnectDialogContainer {...defaultProps} />);
        jest.useFakeTimers();
        fireEvent.click(getByText("Join"));
        jest.advanceTimersByTime(35_000);
        jest.useRealTimers();
      });
      afterEach(() => {
        jest.useRealTimers();
      })

      it("tells user to reconnect to AP", () => {
        expect(
          queryByText(
            "Your computer has disconnected from the wifi network 'pi-top'. Please reconnect to it."
          )
        );
      });

      it("renders error message", () => {
        expect(
          queryByText(
            "`There was an error connecting to password-protected-ssid... please check your password and try again`"
          )
        );
      });

      it("keeps checking if connected to network", () => {
        let callCount = wifiConnectionInformationMock.mock.calls.length;
        jest.advanceTimersByTime(3_000);
        expect(wifiConnectionInformationMock.mock.calls.length).toBeGreaterThan(callCount);
      });

      it("updates message if consecuential checks determine that connection was successful", async () => {
        setWifiInfo("", "unsecured-bssid", ["unsecured-bssid"]);

        jest.advanceTimersByTime(5_000);
        jest.useRealTimers();

        await waitFor(() => {
          expect(within(screen.getByText(/Great, your pi-top is connected to/)).getByText(defaultProps!.network!.ssid)).toBeInTheDocument()
        });
      });

    });
  });

});
