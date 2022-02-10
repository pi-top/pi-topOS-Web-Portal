import React from "react";
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

import LanguagePage, { Props, ErrorMessage } from "../LanguagePage";
import {
  createLocaleFromCode,
  createLabelFromLocale,
} from "../../../helpers/locales";
import localeIsSupported from "../helpers/localeIsSupported";
import { Locale } from "../../../types/Locale";
import openReactSelectMenu from '../../../../test/helpers/openReactSelectMenu';
import reactSelectIsDisabled from "../../../../test/helpers/reactSelectIsDisabled";
import querySpinner from '../../../../test/helpers/querySpinner';

describe("LanguagePage", () => {
  let defaultProps: Props;
  let languagePage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      locales: [],
      setLocale: jest.fn(),
      isGettingLocales: false,
      isSettingLocale: false,
      getLocaleCodesError: false,
      setLocaleError: false,
      onSkipClick: jest.fn(),
      alwaysAllowSkip: false,
    };

    ({
      container: languagePage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<LanguagePage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("language-screen-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = languagePage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    expect(queryByText("Choose your language")).toBeInTheDocument();
  });

  it("does not render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders next button", () => {
    expect(queryByText("Next")).toBeInTheDocument();
  });

  it('does not render skip button', () => {
    expect(queryByText('Skip')).not.toBeInTheDocument();
  });

  it("renders default language as selected option", () => {
    expect(
      queryByText("English (United States of America)")
    ).toBeInTheDocument();
  });

  describe('when isGettingLocales is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isGettingLocales: true,
      };

      rerender(<LanguagePage {...defaultProps} />)
    });

    it('does not render select', () => {
      expect(
        queryByText("English (United States of America)")
      ).not.toBeInTheDocument();
    });

    it('disables the next button', () => {
      expect(getByText("Next").parentElement).toBeDisabled();
    })
  })

  describe('when isSettingLocales is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isSettingLocale: true,
      };

      rerender(<LanguagePage {...defaultProps} />)
    });

    it('does not render the next button', () => {
      expect(queryByText("Next")).not.toBeInTheDocument();
    });

    it('renders loading spinner', () => {
      expect(querySpinner(languagePage)).toBeInTheDocument();
    })

    it('disables the select', () => {
      expect(reactSelectIsDisabled(languagePage)).toEqual(true);
    })
  });

  describe('when getLocaleCodesError is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        getLocaleCodesError: true,
      }

      rerender(<LanguagePage {...defaultProps} />);
    });

    it('renders correct error message', () => {
      expect(queryByText(ErrorMessage.GetLocales)).toBeInTheDocument();
    });
  });

  describe('when setLocaleError is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        setLocaleError: true,
      }

      rerender(<LanguagePage {...defaultProps} />);
    });

    it('renders correct error message', () => {
      expect(queryByText(ErrorMessage.SetLocales)).toBeInTheDocument();
    });

    it('renders skip button', () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it('calls onSkipClick when skip button clicked', () => {
      fireEvent.click(getByText('Skip'));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  });

  describe('when alwaysAllowSkip is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        alwaysAllowSkip: true,
      };

      rerender(<LanguagePage {...defaultProps} />);
    });

    it('renders skip button', () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it('calls onSkipClick when skip button clicked', () => {
      fireEvent.click(getByText('Skip'));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  })

  describe("when locales are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        locales: [createLocaleFromCode("en_GB"), createLocaleFromCode("de_DE")],
        isGettingLocales: false,
      };

      rerender(<LanguagePage {...defaultProps} />);
    });

    it("calls setLocale with correct locale on next button click", () => {
      fireEvent.click(getByText("Next"));

      expect(defaultProps.setLocale).toHaveBeenCalledWith("en_US");
    });

    it("renders correct select options", async () => {
      openReactSelectMenu(languagePage, "English (United States of America)");

      defaultProps.locales.forEach((locale) => {
        expect(queryByText(createLabelFromLocale(locale))).toBeInTheDocument();
      });
    });

    describe('when currentLocaleCode is passed', () => {
      let currentLocale: Locale;
      beforeEach(() => {
        currentLocale = createLocaleFromCode('en_GB');

        defaultProps = {
          ...defaultProps,
          currentLocaleCode: currentLocale.localeCode,
        };

        rerender(<LanguagePage {...defaultProps} />);
      });

      it('renders current locale as selected option', () => {
        expect(queryByText(createLabelFromLocale(currentLocale))).toBeInTheDocument();
      })
    })

    describe("when supported locale is selected", () => {
      let supportedLocale: Locale;
      beforeEach(() => {
        supportedLocale = defaultProps.locales.find(({ localeCode }) =>
          localeIsSupported(localeCode)
        )!;

        openReactSelectMenu(languagePage, "English (United States of America)");

        fireEvent.click(getByText(createLabelFromLocale(supportedLocale)));
      });

      it("does not render unsupported locale error message", () => {
        expect(
          queryByText(ErrorMessage.UnsupportedLocale)
        ).not.toBeInTheDocument();
      });

      it("calls setLocale with correct locale on next button click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setLocale).toHaveBeenCalledWith(
          supportedLocale.localeCode
        );
      });
    });

    describe("when unsupported locale is selected", () => {
      let unsupportedLocale: Locale;
      beforeEach(() => {
        unsupportedLocale = defaultProps.locales.find(
          ({ localeCode }) => !localeIsSupported(localeCode)
        )!;

        openReactSelectMenu(languagePage, "English (United States of America)");

        fireEvent.click(getByText(createLabelFromLocale(unsupportedLocale)));
      });

      it("renders unsupported locale error message", () => {
        expect(queryByText(ErrorMessage.UnsupportedLocale)).toBeInTheDocument();
      });

      it("calls setLocale with correct locale on next button click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setLocale).toHaveBeenCalledWith(
          unsupportedLocale.localeCode
        );
      });
    });
  });
});
