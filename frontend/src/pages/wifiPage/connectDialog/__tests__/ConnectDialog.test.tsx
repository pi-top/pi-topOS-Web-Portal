import React, { ReactNode } from "react";
import ReactDom from "react-dom";
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

import ConnectDialog, { Props } from "../ConnectDialog";
import querySpinner from "../../../../../test/helpers/querySpinner";

const originalCreatePortal = ReactDom.createPortal;

describe("ConnectDialog", () => {
  let defaultProps: Props;
  let connectDialog: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let queryByAltText: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      active: true,
      isConnecting: false,
      isConnected: false,
      onCancel: jest.fn(),
      onDone: jest.fn(),
      connectError: false,
      connect: jest.fn(),
      network: { ssid: "network-name", passwordRequired: true },
    };

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element)(
      ({
        container: connectDialog,
        queryByText,
        queryByTestId,
        queryByAltText,
        queryByLabelText,
        getByLabelText,
        getByText,
        rerender,
      } = render(<ConnectDialog {...defaultProps} />))
    );
  });
  afterEach(() => {
    ReactDom.createPortal = originalCreatePortal;
  });

  it("renders Join button", () => {
    expect(queryByText("Join")).toBeInTheDocument();
  });

  it("renders Cancel button", () => {
    expect(queryByText("Cancel")).toBeInTheDocument();
  });

  it("connect is called when Join button is pressed", () => {
    fireEvent.click(getByText("Join"));
    expect(defaultProps.connect).toHaveBeenCalled();
  });

  it("onCancel is called when Cancel button is pressed", () => {
    fireEvent.click(getByText("Cancel"));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("doesn't render a spinner", () => {
    expect(querySpinner(connectDialog)).not.toBeInTheDocument();
  });

  it("doesn't render the error message", () => {
    expect(
      queryByText(
        "There was an error connecting to network-name... please check your password and try again"
      )
    ).not.toBeInTheDocument();
  });

  describe("when it's connecting to a network", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isConnecting: true,
      };

      rerender(<ConnectDialog {...defaultProps} />);
    });

    it("disables the Join button", () => {
      expect(getByText("Join")).toHaveProperty("disabled");
    });

    it("disables the Cancel button", () => {
      expect(getByText("Cancel")).toHaveProperty("disabled");
    });

    it("hides the password input", () => {
      expect(queryByText("Enter password below")).not.toBeInTheDocument();
    });

    it("hides the 'show password' checkbox", () => {
      expect(queryByText("show password")).not.toBeInTheDocument();
    });

    it("renders a spinner", () => {
      expect(querySpinner(connectDialog)).toBeInTheDocument();
    });
  });

  describe("on connection error", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        connectError: true,
      };
      rerender(<ConnectDialog {...defaultProps} />);
    });

    it("the button label changes to Retry", () => {
      expect(queryByText("Join")).not.toBeInTheDocument();
      expect(queryByText("Retry")).toBeInTheDocument();
    });

    it("renders the error message", () => {
      expect(
        queryByText(
          "There was an error connecting to network-name... please check your password and try again"
        )
      ).toBeInTheDocument();
    });
  });

  describe("when a password protected network is received", () => {
    it("renders dialog message correctly", () => {
      expect(queryByTestId("dialog-message")).toMatchSnapshot();
    });

    it("renders 'show password' checkbox", () => {
      expect(queryByText("show password")).toBeInTheDocument();
    });

    it("renders input to type password", () => {
      expect(queryByText("Enter password below")).toBeInTheDocument();
    });

    it("the 'show password' checkbox has type password", () => {
      expect(queryByLabelText("Enter password below")).toHaveProperty(
        "type",
        "password"
      );
    });

    it("clicking 'show password' checkbox makes password visible", () => {
      fireEvent.click(getByLabelText("show password"));
      expect(queryByLabelText("Enter password below")).toHaveProperty(
        "type",
        "text"
      );
    });
  });

  describe("when an unprotected network is received", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        network: { ssid: "unprotected-network", passwordRequired: false },
      };
      rerender(<ConnectDialog {...defaultProps} />);
    });

    it("renders dialog message correctly", () => {
      expect(queryByTestId("dialog-message")).toMatchSnapshot();
    });
  });

  describe("when connected successfully", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isConnected: true,
      };

      rerender(<ConnectDialog {...defaultProps} />);
    });

    it("the button label changes to OK", () => {
      expect(queryByText("Join")).not.toBeInTheDocument();
      expect(queryByText("Retry")).not.toBeInTheDocument();
      expect(queryByText("OK")).toBeInTheDocument();
    });

    it("disables the cancel button", () => {
      expect(getByText("Cancel")).toBeDisabled();
    });

    it("calls onDone on OK button click", () => {
      fireEvent.click(getByText("OK"));

      expect(defaultProps.onDone).toHaveBeenCalled();
    });

    it("renders connected successfully image", () => {
      expect(queryByAltText("connected-successfully")).toBeInTheDocument();
    });
  });
});
