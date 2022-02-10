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
  wait,
} from "@testing-library/react";

import ConnectivityWarningDialog, { Props, getContent, getMessage } from "../ConnectivityWarningDialog";

const originalCreatePortal = ReactDom.createPortal;

window.open = jest.fn();

describe("ConnectivityWarningDialog", () => {
  let defaultProps: Props;
  let moveAwayFromApDialog: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let queryByAltText: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  const ipAddress = "1.1.1.1";

  beforeEach(() => {
    defaultProps = {
      active: true,
      piTopIpAddress: ipAddress,
      onSkip: jest.fn(),
      onContinue: jest.fn(),
      shouldMoveAwayFromAp: true,
    };

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element)(
      ({
        container: moveAwayFromApDialog,
        queryByText,
        queryByTestId,
        queryByAltText,
        queryByLabelText,
        getByLabelText,
        getByText,
        rerender,
      } = render(<ConnectivityWarningDialog {...defaultProps} />))
    );
  });
  afterEach(() => {
    ReactDom.createPortal = originalCreatePortal;
  });

  describe("when user should switch networks", () =>{
    it("renders the correct message", () => {
      const content = getMessage(true);
      expect(content).toMatchSnapshot();
    });

    it("renders the correct content", () => {
      const content = getContent(true);
      expect(content).toMatchSnapshot();
    });

    it("renders Refresh button", () => {
      expect(queryByText("Refresh")).toBeInTheDocument();
    });

    it("renders Skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("doesn't render the Continue button", () => {
      expect(queryByText("Continue")).not.toBeInTheDocument();
    });


    it("onSkip is called when Skip button is pressed", () => {
      fireEvent.click(getByText("Skip"));
      expect(defaultProps.onSkip).toHaveBeenCalled();
    });

    it("redirects to IP when Refresh button is pressed", async () => {
      fireEvent.click(getByText("Refresh"));
      await wait();
      expect(window.open).toHaveBeenNthCalledWith(
        1,
        "http://" + ipAddress + "/onboarding/reboot",
        "_self"
      )
    });
  })

  describe("when user only connection mode is through AP", () =>{
    beforeEach(()=>{
      defaultProps = {
        ...defaultProps,
        shouldMoveAwayFromAp: false,
      };

      rerender(<ConnectivityWarningDialog {...defaultProps} />);
    })

    it("renders the correct message", () => {
      const content = getMessage(false);
      expect(content).toMatchSnapshot();
    });

    it("renders the correct content", () => {
      const content = getContent(false);
      expect(content).toMatchSnapshot();
    });

    it("renders Continue button", () => {
      expect(queryByText("Continue")).toBeInTheDocument();
    });

    it("doesn't render the Skip button", () => {
      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("doesn't render the Skip button", () => {
      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("onContinue is called when Continue button is pressed", () => {
      fireEvent.click(getByText("Continue"));
      expect(defaultProps.onContinue).toHaveBeenCalled();
    });
  })

});
