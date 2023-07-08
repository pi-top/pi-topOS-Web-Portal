import React from "react";
import { fireEvent, render } from "@testing-library/react";

import Choice from "../Choice";
import { OptionProps } from "../../optionCard/OptionCard";
import querySpinner from "../../../../test/helpers/querySpinner";

const sampleOption1: OptionProps = {
  label: "sampleLabel1",
  value: "sample1",
  thumbnail: "",
  selected: true,
};

const sampleOption2: OptionProps = {
  label: "sampleLabel2",
  value: "sample2",
  thumbnail: "",
  selected: false,
};

describe.only("Choice", () => {
  let container: HTMLElement;
  let queryByAltText: any;
  let queryByText: any;
  let getByText: any;
  let getByLabelText: any;
  let rerender: any;
  let queryByLabelText: any;

  let defaultProps: any;

  beforeEach(() => {
    defaultProps = {
      title: "title",
      description: "description",
      options: [sampleOption1, sampleOption2],
      onOptionClick: jest.fn(),
      nextButton: {
        onClick: jest.fn(),
      },
    };

    ({ container, queryByAltText, queryByText, getByText, getByLabelText, rerender, queryByLabelText } =
      render(<Choice {...defaultProps} />));
  });

  it("renders provided options image", () => {
    expect(queryByAltText(sampleOption1.label)).toBeInTheDocument();
    expect(queryByAltText(sampleOption2.label)).toBeInTheDocument();
  });

  it("calls onOptionClick when an option is clicked", () => {
    expect(defaultProps.onOptionClick).not.toHaveBeenCalled();
    fireEvent.click(getByLabelText(sampleOption1.label));
    expect(defaultProps.onOptionClick).toHaveBeenCalled();
  });

  it("does not render back button", () => {
    expect(queryByText("Back")).not.toBeInTheDocument();
  });

  it("does not render the skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("renders next button", () => {
    expect(queryByText("Next")).toBeInTheDocument();
  });

  it("doesn't call next.onClick on next button click if no option is selected", () => {
    fireEvent.click(getByText("Next"));
    expect(defaultProps.nextButton.onClick).not.toHaveBeenCalled();
  });

  it("Next button is enabled only when a user selection is made", () => {
    // disabled on render
    expect(getByText("Next").parentElement).toHaveProperty("disabled", true);

    // enabled when user selects an option
    fireEvent.click(getByLabelText(sampleOption1.label));
    expect(getByText("Next").parentElement).toHaveProperty("disabled", false);

    // disabled when user selects same option
    fireEvent.click(getByLabelText(sampleOption1.label));
    expect(getByText("Next").parentElement).toHaveProperty("disabled", true);
  });

  it("calls 'next.onClick' on next button click", () => {
    fireEvent.click(getByLabelText(sampleOption1.label));
    fireEvent.click(getByText("Next"));
    expect(defaultProps.nextButton.onClick).toHaveBeenCalled();
  });

  describe("when isLoading is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isLoading: true,
      };

      rerender(<Choice {...defaultProps} />);
    });

    it("does not render next button", () => {
      expect(queryByText("Next")).not.toBeInTheDocument();
    });

    it("renders spinner", () => {
      expect(querySpinner(container)).toBeInTheDocument();
      expect(queryByLabelText("audio-loading")).toBeInTheDocument();
    });
  });

  describe("when label is passed to next button", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        nextButton: {
          ...defaultProps.nextButton,
          label: "Test Label",
        },
      };

      rerender(<Choice {...defaultProps} />);
    });

    it("renders label in next button", () => {
      expect(queryByText(defaultProps.nextButton.label)).toBeInTheDocument();
    });
  });

  describe("when skip button is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        skipButton: {
          onClick: jest.fn(),
        },
      };
    });

    it("does not render skip button", () => {
      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    describe("when showSkip is true", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          showSkip: true,
        };

        rerender(<Choice {...defaultProps} />);
      });

      it("does render skip button", () => {
        expect(queryByText("Skip")).toBeInTheDocument();
      });

      it("calls nextButton.onClick on skip button click", () => {
        fireEvent.click(getByText("Skip"));

        expect(defaultProps.skipButton!.onClick).toHaveBeenCalled();
      });
    });
  });

  describe("when back button is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        backButton: {
          onClick: jest.fn(),
        },
      };
    });

    it("does not render back button", () => {
      expect(queryByText("Back")).not.toBeInTheDocument();
    });

    describe("when showBack is true", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          showBack: true,
        };

        rerender(<Choice {...defaultProps} />);
      });

      it("does renders back button", () => {
        expect(queryByText("Back")).toBeInTheDocument();
      });

      it("calls nextButton.onClick on back button click", () => {
        fireEvent.click(getByText("Back"));

        expect(defaultProps.backButton!.onClick).toHaveBeenCalled();
      });
    });
  });

});
