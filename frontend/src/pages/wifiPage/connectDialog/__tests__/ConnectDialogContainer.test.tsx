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
} from "@testing-library/react";
import ReactDom from "react-dom";

import ConnectDialogContainer, { Props } from "../ConnectDialogContainer";

import { NetworkCredentials } from "../../../../types/Network";
import querySpinner from "../../../../../test/helpers/querySpinner";
import connectToNetwork from "../../../../services/connectToNetwork";
import isConnectedThroughAp from "../../../../services/isConnectedThroughAp";
import connectedBSSID from "../../../../services/connectedBSSID";
import { act } from "react-dom/test-utils";

jest.mock("../../../../services/connectToNetwork");
jest.mock("../../../../services/isConnectedThroughAp");
jest.mock("../../../../services/connectedBSSID");

const connectToNetworkMock = connectToNetwork as jest.Mock;
const isConnectedThroughApMock = isConnectedThroughAp as jest.Mock;
const connectedBSSIDMock = connectedBSSID as jest.Mock;
const originalCreatePortal = ReactDom.createPortal;

describe("ConnectDialogContainer", () => {
  let defaultProps: Props;
  let connectDialogContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  beforeEach(async () => {
    isConnectedThroughApMock.mockResolvedValue(false)
    connectToNetworkMock.mockImplementation(
      (creds: NetworkCredentials) =>
        new Promise((res, rej) => {
          if (
            creds.bssid === "unsecured-bssid" ||
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

    await wait();

    expect(queryByText(`Great, your pi-top is connected to '${defaultProps?.network?.ssid}'!`)).toBeInTheDocument();
  });

  describe("when there's an error connecting to a network", ()  => {
    beforeEach(async () => {
      connectToNetworkMock.mockRejectedValue(new Error(`oh oh`));
      rerender(<ConnectDialogContainer {...defaultProps} />);
      fireEvent.click(getByText("Join"));
      await wait();
    })

    it("renders an error message", async () => {
      expect(
        queryByText(
          "There was an error connecting to unsecured-ssid... please check your password and try again"
        )
      ).toBeInTheDocument();
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
        expect(queryByText(`Great, your pi-top is connected to '${defaultProps?.network?.ssid}'!`)).toBeInTheDocument();
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
      isConnectedThroughApMock.mockResolvedValue(true)
    });

    describe("and the connect-to-wifi request times outs", () => {
      beforeEach(async () => {
        connectToNetworkMock.mockRejectedValue(new Error(`Timeout`));

        defaultProps = {
          ...defaultProps,
          network: {
            ssid: "unsecured-ssid",
            bssid: "unsecured-bssid",
            passwordRequired: false,
          },
        };
        jest.useFakeTimers();

        rerender(<ConnectDialogContainer {...defaultProps} />);
        fireEvent.click(getByText("Join"));
        await wait();
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
        expect(connectedBSSIDMock).toHaveBeenCalledTimes(0);
        jest.runOnlyPendingTimers();
        expect(connectedBSSIDMock.mock.calls.length).toBeGreaterThan(1);
      });

      it("updates message if consecuential checks determine that connection was successful", async () => {
        jest.runOnlyPendingTimers();
        expect(connectedBSSIDMock.mock.calls.length).toBeGreaterThan(1);

        connectedBSSIDMock.mockResolvedValue("unsecured-bssid")
        connectToNetworkMock.mockImplementation(
          (creds: NetworkCredentials) =>
            new Promise((res) => {
              return res();
            })
        );

        jest.runOnlyPendingTimers();
        await wait()

        expect(queryByText(`Great, your pi-top is connected to '${defaultProps?.network?.ssid}'!`)).toBeInTheDocument();
      });

    });
  });

});
