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

import AdvancedConfigDialog, { Props, ErrorMessage } from "../AdvancedConfigDialog";
import querySpinner from "../../../../../test/helpers/querySpinner";

const originalCreatePortal = ReactDom.createPortal;

describe("AdvancedConfigDialog", () => {
  let defaultProps: Props;
  let advancedConfigDialog: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  beforeEach(() => {
    defaultProps = {
      active: true,
      url: "",
      onClose: jest.fn(),
      error: false,
    };

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element)(
      ({
        container: advancedConfigDialog,
        queryByText,
        queryByTestId,
        getByText,
        rerender,
      } = render(<AdvancedConfigDialog {...defaultProps} />))
    );
  });
  afterEach(() => {
    ReactDom.createPortal = originalCreatePortal;
  });

  it("renders the 'close' button", () => {
    expect(queryByText("Close")).toBeInTheDocument();
  });

  it("onClose is called when Close button is pressed", () => {
    fireEvent.click(getByText("Close"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("renders a spinner", () => {
    expect(querySpinner(advancedConfigDialog)).toBeInTheDocument();
  });

  it("doesn't render the error message", () => {
    expect(queryByText(ErrorMessage.AdvancedConfigError)).not.toBeInTheDocument();
  });

  describe("on error while preparing", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        error: true,
      };
      rerender(<AdvancedConfigDialog {...defaultProps} />);
    });

    it("renders the 'close' button", () => {
      expect(queryByText("Close")).toBeInTheDocument();
    });

    it("renders the error message", () => {
      expect(queryByText(ErrorMessage.AdvancedConfigError)).toBeInTheDocument();
    });

    it("renders a spinner", () => {
      expect(querySpinner(advancedConfigDialog)).toBeInTheDocument();
    });
  });

  describe("on error while preparing", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        error: true,
        url: "http://pi-top.com",
      };
      rerender(<AdvancedConfigDialog {...defaultProps} />);
    });

    it("renders the 'close' button", () => {
      expect(queryByText("Close")).toBeInTheDocument();
    });

    it("renders the error message", () => {
      expect(queryByText(ErrorMessage.AdvancedConfigError)).toBeInTheDocument();
    });

    it("doesn't render a spinner", () => {
      expect(querySpinner(advancedConfigDialog)).not.toBeInTheDocument();
    });
  });

  describe("when an URL is received", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        url: "http://pi-top.com",
      };
      rerender(<AdvancedConfigDialog {...defaultProps} />);
    });

    it("renders the 'close' button", () => {
      expect(queryByText("Close")).toBeInTheDocument();
    });

    it("doesn't render the error message", () => {
      expect(queryByText(ErrorMessage.AdvancedConfigError)).not.toBeInTheDocument();
    });

    it("doesn't render a spinner", () => {
      expect(querySpinner(advancedConfigDialog)).not.toBeInTheDocument();
    });

    it("renders an iframe", () => {
      expect(queryByTestId("advanced-config-dialog-frame")).toBeInTheDocument();
    });

    it("iframe opens the provided url", () => {
      expect(queryByTestId("advanced-config-dialog-frame")).toMatchSnapshot();
    });

    describe("and an error is received", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          url: "http://pi-top.com",
          error: true,
        };
        rerender(<AdvancedConfigDialog {...defaultProps} />);
      });

      it("renders the 'close' button", () => {
        expect(queryByText("Close")).toBeInTheDocument();
      });

      it("renders the error message", () => {
        expect(queryByText(ErrorMessage.AdvancedConfigError)).toBeInTheDocument();
      });

      it("doesn't render a spinner", () => {
        expect(querySpinner(advancedConfigDialog)).not.toBeInTheDocument();
      });

      it("renders an iframe", () => {
        expect(queryByTestId("advanced-config-dialog-frame")).toBeInTheDocument();
      });
    })

  });

});
