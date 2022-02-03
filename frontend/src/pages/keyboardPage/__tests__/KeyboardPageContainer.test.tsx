import React from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  RenderResult,
  wait,
  fireEvent,
} from "@testing-library/react";

import KeyboardPageContainer, { Props } from "../KeyboardPageContainer";
import { ErrorMessage } from "../KeyboardPage";

import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import openReactSelectMenu from "../../../../test/helpers/openReactSelectMenu";

import getKeyboards from "../../../services/getKeyboards";
import getKeyboardVariants from "../../../services/getKeyboardVariants";
import getCurrentKeyboard from "../../../services/getCurrentKeyboard";
import setKeyboard from "../../../services/setKeyboard";

import keyboards from "./data/keyboards.json";
import keyboardVariants from "./data/keyboardVariants.json";
import { Keyboard } from "../../../types/Keyboard";
import { createLabelFromKeyboard } from "../helpers/keyboardSelect";
import reactSelectIsDisabled from "../../../../test/helpers/reactSelectIsDisabled";

jest.mock("../../../services/getKeyboards");
jest.mock("../../../services/getKeyboardVariants");
jest.mock("../../../services/getCurrentKeyboard");
jest.mock("../../../services/setKeyboard");

const getKeyboardsMock = getKeyboards as jest.Mock;
const getKeyboardVariantsMock = getKeyboardVariants as jest.Mock;
const currentKeyboardMock = getCurrentKeyboard as jest.Mock;
const setKeyboardMock = setKeyboard as jest.Mock;

describe("KeyboardPageContainer", () => {
  let defaultProps: Props;
  let keyboardPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let rerender: RenderResult["rerender"];
  let currentKeyboard: Keyboard;
  beforeEach(async () => {
    currentKeyboard = {
      layout: 'us'
    }
    getKeyboardsMock.mockResolvedValue(keyboards);
    getKeyboardVariantsMock.mockResolvedValue(keyboardVariants);
    currentKeyboardMock.mockResolvedValue(currentKeyboard);
    setKeyboardMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      isCompleted: false,
    };
  });
  afterEach(() => {
    getKeyboardsMock.mockRestore();
    setKeyboardMock.mockRestore();
    currentKeyboardMock.mockRestore();
  });

  it("disables the next button while loading", async () => {
    ({ queryByText } = render(<KeyboardPageContainer {...defaultProps} />));

    expect(queryByText("Next")?.parentElement).toBeDisabled();

    await wait();
  });

  it("does not render the select while loading", async () => {
    ({ container: keyboardPageContainer } = render(
      <KeyboardPageContainer {...defaultProps} />
    ));

    expect(queryReactSelect(keyboardPageContainer)).not.toBeInTheDocument();

    await wait();
  });

  describe("when getCurrentKeyboard service fails", () => {
    beforeEach(async () => {
      currentKeyboardMock.mockRejectedValue(
        new Error("Failed to get current keyboard")
      );

      ({
        container: keyboardPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<KeyboardPageContainer {...defaultProps} />));

      await wait();
    });

    it.skip("renders keyboards as options", () => {
      const keyboardSelectInput = keyboardPageContainer.querySelector(
        ".ReactSelect"
      );
      fireEvent.click(keyboardSelectInput!);

      expect(
        queryByText(
          createLabelFromKeyboard({ layout: "gb" }, keyboards, keyboardVariants)
        )
      ).toBeInTheDocument();
    });
  });

  describe("when getKeyboards service fails", () => {
    beforeEach(async () => {
      getKeyboardsMock.mockRejectedValue(new Error("Failed to get keyboards"));

      ({
        container: keyboardPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<KeyboardPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders error message", () => {
      expect(queryByText(ErrorMessage.GetKeyboards)).toBeInTheDocument();
    });
  });

  describe("when services are successful", () => {
    beforeEach(async () => {
      ({
        container: keyboardPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<KeyboardPageContainer {...defaultProps} />));

      await wait();
    });

    it("enables next button", () => {
      expect(queryByText("Next")).not.toBeDisabled();
    });

    it("renders current keyboard as selected keyboard", () => {
      expect(
        queryByText(
          createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
        )
      ).toBeInTheDocument();
    });

    it("renders keyboards as options", () => {
      openReactSelectMenu(
        keyboardPageContainer,
        createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
      );

      expect(
        queryByText(
          createLabelFromKeyboard({ layout: "gb" }, keyboards, keyboardVariants)
        )
      ).toBeInTheDocument();
    });

    describe("when isCompleted is true", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          isCompleted: true,
        };
        rerender(<KeyboardPageContainer {...defaultProps} />);
      });

      it("renders skip button", () => {
        expect(queryByText("Skip")).toBeInTheDocument();
      });

      it("calls goToNextPage on skip button click", () => {
        fireEvent.click(getByText("Skip"));

        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });
    });

    describe("when next button clicked", () => {
      beforeEach(() => {
        fireEvent.click(getByText("Next"));
      });

      it("calls goToNextPage", () => {
        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });
    });

    describe("when user selects new keyboard", () => {
      let selectedKeyboard: Keyboard;
      beforeEach(() => {
        selectedKeyboard = { layout: "gb", variant: "dvorak" };
      });

      it("calls setKeyboard with correct keyboard", async () => {
        openReactSelectMenu(
          keyboardPageContainer,
          createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
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

        expect(setKeyboardMock).toHaveBeenCalledWith(selectedKeyboard);

        await wait();
      });

      it("indicates to the user while setting", async () => {
        openReactSelectMenu(
          keyboardPageContainer,
          createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
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

        expect(queryByText("setting keyboard...")).toBeInTheDocument();

        await wait();
      });

      it("disables keyboard select while setting", async () => {
        openReactSelectMenu(
          keyboardPageContainer,
          createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
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

        expect(reactSelectIsDisabled(keyboardPageContainer)).toEqual(true);

        await wait();
      });

      it("has new keyboard as selected while setting", async () => {
        openReactSelectMenu(
          keyboardPageContainer,
          createLabelFromKeyboard(currentKeyboard, keyboards, keyboardVariants)
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

        expect(
          queryByText(
            createLabelFromKeyboard(
              selectedKeyboard,
              keyboards,
              keyboardVariants
            )
          )
        ).toBeInTheDocument();

        await wait();
      });

      describe("when keyboard is set successfully", () => {
        beforeEach(async () => {
          openReactSelectMenu(
            keyboardPageContainer,
            createLabelFromKeyboard(
              currentKeyboard,
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

          await wait();
        });

        it("has new keyboard as selected", async () => {
          expect(
            queryByText(
              createLabelFromKeyboard(
                selectedKeyboard,
                keyboards,
                keyboardVariants
              )
            )
          ).toBeInTheDocument();
        });

        it("enables keyboard select", async () => {
          expect(reactSelectIsDisabled(keyboardPageContainer)).toEqual(false);
        });

        it("removes settings keyboard message", async () => {
          expect(queryByText("setting keyboard...")).not.toBeInTheDocument();
        });
      });

      describe("when keyboard service fails", () => {
        beforeEach(async () => {
          setKeyboardMock.mockRejectedValue(
            new Error("Unable to set keyboard")
          );

          openReactSelectMenu(
            keyboardPageContainer,
            createLabelFromKeyboard(
              currentKeyboard,
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

          await wait();
        });

        it("renders error message", async () => {
          expect(
            queryByText(
              ErrorMessage.SetKeyboard
            )
          ).toBeInTheDocument();
        });

        it("enables keyboard select", async () => {
          expect(reactSelectIsDisabled(keyboardPageContainer)).toEqual(false);
        });

        it("removes settings keyboard message", async () => {
          expect(queryByText("setting keyboard...")).not.toBeInTheDocument();
        });
      });
    });
  });
});
