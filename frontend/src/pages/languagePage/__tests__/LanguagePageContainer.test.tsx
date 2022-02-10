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

import LanguagePageContainer, { Props } from "../LanguagePageContainer";
import {
  createLocaleFromCode,
  createLabelFromLocale,
  americanEnglishLocale,
} from "../../../helpers/locales";
import { Locale } from "../../../types/Locale";
import getLocales from "../../../services/getLocales";
import getCurrentLocale from "../../../services/getCurrentLocale";
import setLocale from "../../../services/setLocale";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import openReactSelectMenu from "../../../../test/helpers/openReactSelectMenu";
import querySpinner from '../../../../test/helpers/querySpinner';
import { ErrorMessage } from "../LanguagePage";
import { act } from "react-dom/test-utils";

jest.mock("../../../services/getLocales");
jest.mock("../../../services/getCurrentLocale");
jest.mock("../../../services/setLocale");

const getLocalesMock = getLocales as jest.Mock;
const currentLocaleMock = getCurrentLocale as jest.Mock;
const setLocaleMock = setLocale as jest.Mock;

describe("LanguagePageContainer", () => {
  let currentLocale: Locale;
  let locales: Locale[];
  let defaultProps: Props;
  let languagePageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let rerender: RenderResult["rerender"];
  beforeEach(async () => {
    currentLocale = createLocaleFromCode("en_GB");
    locales = [
      currentLocale,
      createLocaleFromCode("de_DE"),
      americanEnglishLocale,
    ];

    getLocalesMock.mockResolvedValue(locales);
    currentLocaleMock.mockResolvedValue("en_GB");
    setLocaleMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn(),
      setExpectedUserCountry: jest.fn(),
      isCompleted: false,
    };
  });
  afterEach(() => {
    getLocalesMock.mockRestore();
    setLocaleMock.mockRestore();
    currentLocaleMock.mockRestore();
  });

  it("disables the next button while loading", async () => {
    ({ queryByText } = render(<LanguagePageContainer {...defaultProps} />));

    expect(queryByText("Next")?.parentElement).toBeDisabled();

    await wait();
  });

  it("does not render the select while loading", async () => {
    ({ container: languagePageContainer } = render(
      <LanguagePageContainer {...defaultProps} />
    ));

    expect(queryReactSelect(languagePageContainer)).not.toBeInTheDocument();

    await wait();
  });

  describe("when getCurrentLocale service fails", () => {
    beforeEach(async () => {
      currentLocaleMock.mockRejectedValue(
        new Error("Failed to get current locale")
      );

      ({
        container: languagePageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<LanguagePageContainer {...defaultProps} />));

      await wait();
    });

    it("renders default selected locale", () => {
      expect(
        queryByText(createLabelFromLocale(americanEnglishLocale))
      ).toBeInTheDocument();
    });

    it("renders locales as options", () => {
      openReactSelectMenu(
        languagePageContainer,
        createLabelFromLocale(americanEnglishLocale)
      );

      expect(
        queryByText(createLabelFromLocale(locales[1]))
      ).toBeInTheDocument();
    });
  });

  describe("when getLocales service fails", () => {
    beforeEach(async () => {
      getLocalesMock.mockRejectedValue(new Error("Failed to get locales"));

      ({
        container: languagePageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<LanguagePageContainer {...defaultProps} />));

      await wait();
    });

    it("renders default selected locale", () => {
      expect(
        queryByText(createLabelFromLocale(americanEnglishLocale))
      ).toBeInTheDocument();
    });

    it("renders error message", () => {
      expect(queryByText(ErrorMessage.GetLocales)).toBeInTheDocument();
    });
  });

  describe("when services are successful", () => {
    beforeEach(async () => {
      ({
        container: languagePageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<LanguagePageContainer {...defaultProps} />));

      await wait();
    });

    it("enables next button", () => {
      expect(queryByText("Next")).not.toBeDisabled();
    });

    it("renders current locale as selected locale", () => {
      expect(
        queryByText(createLabelFromLocale(currentLocale))
      ).toBeInTheDocument();
    });

    it("renders locales as options", () => {
      openReactSelectMenu(
        languagePageContainer,
        createLabelFromLocale(currentLocale)
      );

      expect(
        queryByText(createLabelFromLocale(locales[1]))
      ).toBeInTheDocument();
    });

    describe("when isCompleted is true", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          isCompleted: true,
        };
        rerender(<LanguagePageContainer {...defaultProps} />);
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

      it("renders loading spinner", () => {
        expect(querySpinner(languagePageContainer)).toBeInTheDocument();
      });

      it("calls goToNextPage", () => {
        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });

      it("does not call setLocale", () => {
        expect(setLocaleMock).not.toHaveBeenCalled();
      });
    });

    describe("when currentLocale does not match selected locale", () => {
      let selectedLocale: Locale;
      beforeEach(() => {
        openReactSelectMenu(
          languagePageContainer,
          createLabelFromLocale(currentLocale)
        );

        selectedLocale = locales[1];
        fireEvent.click(getByText(createLabelFromLocale(selectedLocale)));
      });

      it("calls setLocale with correct localeCode on next button click", async () => {
        fireEvent.click(getByText("Next"));

        expect(setLocaleMock).toHaveBeenCalledWith(selectedLocale.localeCode);

        await wait();
      });

      it("calls setExpectedUserCountry with correct country code", async () => {
        fireEvent.click(getByText("Next"));
        await wait();

        expect(defaultProps.setExpectedUserCountry).toHaveBeenCalledWith("DE");
      });

      it("calls goToNextPage", async () => {
        fireEvent.click(getByText("Next"));
        await wait();

        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });

      describe("when setLocale fails on next button click", () => {
        beforeEach(async () => {
          setLocaleMock.mockRejectedValue(new Error("Unable to set locale"));

          await act(async () => {
            fireEvent.click(getByText("Next"));
            await wait();
          });
        });

        it("does not call goToNextPage", () => {
          expect(defaultProps.goToNextPage).not.toHaveBeenCalled();
        });

        it("renders next button", () => {
          expect(queryByText("Next")).toBeInTheDocument();
        });

        it("renders skip button", () => {
          expect(queryByText("Skip")).toBeInTheDocument();
        });

        it("calls goToNextPage on skip click", () => {
          fireEvent.click(getByText("Skip"));

          expect(defaultProps.goToNextPage).toHaveBeenCalled();
        });
      });
    });
  });
});
