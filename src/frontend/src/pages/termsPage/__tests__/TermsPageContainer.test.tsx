import React from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  RenderResult,
  fireEvent,
} from "@testing-library/react";

import TermsPageContainer, { Props } from "../TermsPageContainer";

describe("TermsPageContainer", () => {
  let defaultProps: Props;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let rerender: RenderResult["rerender"];
  beforeEach(async () => {
    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      isCompleted: false,
    };

    ({
      queryByText,
      getByText,
      rerender,
    } = render(<TermsPageContainer {...defaultProps} />));
  });

  it("does not render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("calls goToNextPage on next button click", () => {
    fireEvent.click(getByText("Agree"));

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });

  describe("when isCompleted is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isCompleted: true,
      };

      rerender(<TermsPageContainer {...defaultProps} />);
    });

    it("renders skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls goToNextPage on skip button click", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  });
});
