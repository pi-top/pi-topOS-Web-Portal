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

import KeyboardPage, { Props, ErrorMessage } from "../KeyboardPage";
import openReactSelectMenu from "../../../../test/helpers/openReactSelectMenu";
import keyboards from "./data/keyboards.json";
import keyboardVariants from "./data/keyboardVariants.json";
import { Keyboard } from "../../../types/Keyboard";
import querySpinner from "../../../../test/helpers/querySpinner";
import { createLabelFromKeyboard } from "../helpers/keyboardSelect";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import reactSelectIsDisabled from "../../../../test/helpers/reactSelectIsDisabled";

describe("KeyboardPage", () => {
  let defaultProps: Props;
  let keyboardPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      keyboards: {},
      keyboardVariants: {},
      currentKeyboard: {
        layout: "us",
      },
      isGettingKeyboards: false,
      setKeyboard: jest.fn(),
      settingKeyboard: null,
      getKeyboardsError: false,
      setKeyboardError: false,
      onBackClick: jest.fn(),
      onSkipClick: jest.fn(),
      onNextClick: jest.fn(),
      alwaysAllowSkip: false,
    };

    ({
      container: keyboardPage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<KeyboardPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("keyboard-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = keyboardPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    expect(
      queryByText("Which keyboard layout would you like to use?")
    ).toBeInTheDocument();
  });

  it("does not render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders next button", () => {
    expect(queryByText("Next")).toBeInTheDocument();
  });

  it("does not render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("renders current keyboard as selected option", () => {
    expect(
      queryByText(
        createLabelFromKeyboard(
          defaultProps.currentKeyboard,
          keyboards,
          keyboardVariants
        )
      )
    ).toBeInTheDocument();
  });

  describe("when isGettingKeyboards is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isGettingKeyboards: true,
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("does not render select", () => {
      expect(queryReactSelect(keyboardPage)).not.toBeInTheDocument();
    });

    it("disables the next button", () => {
      expect(getByText("Next")).toBeDisabled();
    });
  });

  describe("when settingKeyboard is set", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        settingKeyboard: {
          layout: "gb",
        },
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("disables next button", () => {
      expect(queryByText("Next")).toBeDisabled();
    });

    it("sets settingKeyboard as selected option", () => {
      expect(
        queryByText(
          createLabelFromKeyboard(
            defaultProps.settingKeyboard!,
            keyboards,
            keyboardVariants
          )
        )
      ).toBeInTheDocument();
    });

    it('disables select', () => {
      expect(reactSelectIsDisabled(keyboardPage)).toEqual(true);
    })

    it("renders setting keyboard message", () => {
      expect(queryByText("setting keyboard...")).toBeInTheDocument();
    });

    it("renders loading spinner", () => {
      expect(querySpinner(keyboardPage)).toBeInTheDocument();
    });
  });

  describe("when getKeyboardsError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        getKeyboardsError: true,
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.GetKeyboards)).toBeInTheDocument();
    });
  });

  describe("when setKeyboardError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        setKeyboardError: true,
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.SetKeyboard)).toBeInTheDocument();
    });

    it("renders skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  });

  describe("when alwaysAllowSkip is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        alwaysAllowSkip: true,
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("renders skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  });

  describe("when keyboards are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        keyboards: { ...keyboards },
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("renders correct keyboard select options", async () => {
      openReactSelectMenu(
        keyboardPage,
        createLabelFromKeyboard(
          defaultProps.currentKeyboard,
          keyboards,
          keyboardVariants
        )
      );

      Object.keys(defaultProps.keyboards).forEach((layout) => {
        // exclude current keyboard as it is already in the select input
        if (layout === defaultProps.currentKeyboard.layout) return;

        expect(
          queryByText(
            createLabelFromKeyboard(
              {
                layout,
              },
              keyboards,
              keyboardVariants
            )
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("when keyboards and keyboardVariants are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        keyboards: { ...keyboards },
        keyboardVariants: { ...keyboardVariants },
      };

      rerender(<KeyboardPage {...defaultProps} />);
    });

    it("renders correct keyboard select options", async () => {
      openReactSelectMenu(
        keyboardPage,
        createLabelFromKeyboard(
          defaultProps.currentKeyboard,
          keyboards,
          keyboardVariants
        )
      );

      Object.keys(defaultProps.keyboards).forEach((layout) => {
        // exclude current keyboard as it is already in the select input
        if (layout === defaultProps.currentKeyboard.layout) return;

        expect(
          queryByText(
            createLabelFromKeyboard(
              {
                layout,
              },
              keyboards,
              keyboardVariants
            )
          )
        ).toBeInTheDocument();

        // @ts-ignore
        const variants = keyboardVariants[layout];
        if (variants) {
          expect(
            queryByText(
              createLabelFromKeyboard(
                {
                  layout,
                  // @ts-ignore
                  variant: Object.keys(variants)[0],
                },
                keyboards,
                keyboardVariants
              )
            )
          );
        }
      });
    });

    describe("when new keyboard is selected", () => {
      let selectedKeyboard: Keyboard;
      beforeEach(() => {
        selectedKeyboard = {
          layout: "gb",
          variant: "dvorak",
        };

        openReactSelectMenu(
          keyboardPage,
          createLabelFromKeyboard(
            defaultProps.currentKeyboard,
            keyboards,
            keyboardVariants
          )
        );

        fireEvent.click(
          getByText(
            createLabelFromKeyboard(
              selectedKeyboard,
              keyboards,
              keyboardVariants
            )
          )
        );
      });

      it("calls setKeyboard with correct keyboard", () => {
        expect(defaultProps.setKeyboard).toHaveBeenCalledWith(selectedKeyboard);
      });
    });
  });
});
