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

jest.mock("../../../../services/connectToNetwork");

const connectToNetworkMock = connectToNetwork as jest.Mock;
const originalCreatePortal = ReactDom.createPortal;

describe("ConnectDialogContainer", () => {
  let defaultProps: Props;
  let connectDialogContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(async () => {
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

    expect(queryByText("Great, you are connected!")).toBeInTheDocument();
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

    it("renders error message when unable to join", async () => {
      fireEvent.click(getByText("Join"));

      await wait();

      expect(
        queryByText(
          `There was an error connecting to password-protected-ssid... please check your password and try again`
        )
      );
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
        expect(queryByText("Great, you are connected!")).toBeInTheDocument();
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
});
