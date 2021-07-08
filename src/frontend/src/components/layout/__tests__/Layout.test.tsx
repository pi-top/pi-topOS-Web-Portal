import { render, fireEvent } from "@testing-library/react";

import Layout, { Props } from "../Layout";
import querySpinner from "../../../../test/helpers/querySpinner";

describe("Layout", () => {
  let layout: HTMLElement;
  let defaultProps: Props;
  let queryByAltText: any;
  let queryByText: any;
  let queryByLabelText: any;
  let getByText: any;
  let rerender: any;
  beforeEach(() => {
    defaultProps = {
      banner: {
        src: "test-banner-src",
        alt: "test-banner-alt",
      },
      prompt: <b>A Bold Test Prompt</b>,
      nextButton: { onClick: jest.fn() },
    };

    ({
      container: layout,
      queryByAltText,
      queryByText,
      queryByLabelText,
      getByText,
      rerender,
    } = render(<Layout {...defaultProps} />));
  });

  it("renders banner image", () => {
    expect(queryByAltText(defaultProps.banner.alt)).toBeInTheDocument();
  });

  it("renders prompt", () => {
    expect(queryByText("A Bold Test Prompt")).toBeInTheDocument();
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

  it("calls next.onClick on next button click", () => {
    fireEvent.click(getByText("Next"));

    expect(defaultProps.nextButton.onClick).toHaveBeenCalled();
  });

  describe("when isLoading is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isLoading: true,
      };

      rerender(<Layout {...defaultProps} />);
    });

    it("does not render next button", () => {
      expect(queryByText("Next")).not.toBeInTheDocument();
    });

    it("renders spinner", () => {
      expect(querySpinner(layout)).toBeInTheDocument();
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

      rerender(<Layout {...defaultProps} />);
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

        rerender(<Layout {...defaultProps} />);
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

        rerender(<Layout {...defaultProps} />);
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

  describe("when explanation is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        explanation: "do the thing because of a very compelling reason",
      };

      rerender(<Layout {...defaultProps} />)
    });

    it("renders explanation", () => {
      expect(queryByText(defaultProps.explanation)).toBeInTheDocument();
    });
  });

  describe("when children are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        children: <div>Beautiful baby div</div>,
      };

      rerender(<Layout {...defaultProps} />)
    });

    it("renders children", () => {
      expect(queryByText("Beautiful baby div")).toBeInTheDocument();
    });
  });
});
