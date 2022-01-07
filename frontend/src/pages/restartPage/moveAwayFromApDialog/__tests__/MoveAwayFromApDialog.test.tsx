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

import MoveAwayFromApDialog, { Props, getContent, getMessage } from "../MoveAwayFromApDialog";
import querySpinner from "../../../../../test/helpers/querySpinner";

const originalCreatePortal = ReactDom.createPortal;

window.open = jest.fn();

describe("MoveAwayFromApDialog", () => {
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
      } = render(<MoveAwayFromApDialog {...defaultProps} />))
    );
  });
  afterEach(() => {
    ReactDom.createPortal = originalCreatePortal;
  });

  it("renders the correct message", () => {
    const content = getMessage();
    expect(content).toMatchSnapshot();
  });

  it("renders the correct content", () => {
    const content = getContent();
    expect(content).toMatchSnapshot();
  });

  it("renders Refresh button", () => {
    expect(queryByText("Refresh")).toBeInTheDocument();
  });

  it("renders Skip button", () => {
    expect(queryByText("Skip")).toBeInTheDocument();
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

});
