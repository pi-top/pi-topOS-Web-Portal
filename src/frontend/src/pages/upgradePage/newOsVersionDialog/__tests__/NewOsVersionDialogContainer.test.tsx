import React, { ReactNode } from "react";
import {
  render,
  BoundFunction,
  GetByText,
  fireEvent,
} from "@testing-library/react";
import ReactDom from "react-dom";

import NewOsVersionDialogContainer, { Props } from "../NewOsVersionDialogContainer";


describe("NewOsVersionDialogContainer", () => {
  let defaultProps: Props;
  let connectDialogContainer: HTMLElement;
  let getByText: BoundFunction<GetByText>;

  beforeEach(async () => {
    ReactDom.createPortal = jest.fn();
    const createPortalMock = ReactDom.createPortal as jest.Mock;
    createPortalMock.mockImplementation((element: ReactNode) => element);

    defaultProps = {
      active: true,
      requireBurn: false,
      shouldBurn: false,
      onClose: jest.fn()
    };

    ({
      container: connectDialogContainer,
      getByText,
    } = render(<NewOsVersionDialogContainer {...defaultProps} />));
  });

  it("renders Close button", () => {
    expect(getByText("Close")).toBeInTheDocument();
  });

  it("calls onClose correctly on Close button click", () => {
    fireEvent.click(getByText("Close"));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

});
