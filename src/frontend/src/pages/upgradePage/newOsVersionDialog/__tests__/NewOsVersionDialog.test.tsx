import React, { ReactNode } from "react";
import ReactDom from "react-dom";
import {
  render,
  fireEvent,
  BoundFunction,
  QueryByText,
  GetByText
} from "@testing-library/react";

import NewOsVersionDialog, { Props } from "../NewOsVersionDialog";

const originalCreatePortal = ReactDom.createPortal;

describe("NewOsVersionDialog", () => {
  let defaultProps: Props;
  let connectDialog: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;

  beforeEach(() => {
    defaultProps = {
      active: true,
      shouldBurn: false,
      requireBurn: false,
      onClose: jest.fn(),
    };

    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element)(
      ({
        container: connectDialog,
        queryByText,
        getByText,
      } = render(<NewOsVersionDialog {...defaultProps} />))
    );
  });
  afterEach(() => {
    ReactDom.createPortal = originalCreatePortal;
  });

  it("renders Close button", () => {
    expect(queryByText("Close")).toBeInTheDocument();
  });

  it("onClose is called when Close button is pressed", () => {
    fireEvent.click(getByText("Close"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
