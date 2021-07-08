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

import CountryPage, { Props, ErrorMessage } from "../CountryPage";
import openReactSelectMenu from "../../../../test/helpers/openReactSelectMenu";
import countries from "./data/countries.json";
import timezones from "./data/timezones.json";
import { getName } from "country-list";
import createLabelFromTimezone from "../helpers/createLabelFromTimezone";

describe("CountryPage", () => {
  let defaultProps: Props;
  let countryPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      countries: {},
      timezones: [],
      currentCountryCode: "US",
      currentTimezoneCode: "America/New_York",
      isGettingCountries: false,
      isSetting: false,
      getCountriesError: false,
      setError: false,
      onSkipClick: jest.fn(),
      alwaysAllowSkip: false,
      setCountryAndTimezone: jest.fn(),
      onBackClick: jest.fn(),
    };

    ({
      container: countryPage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<CountryPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("country-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = countryPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    expect(
      queryByText("Choose the country we’re in from the list below.")
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

  it("renders current country as selected option", () => {
    expect(queryByText("United States of America")).toBeInTheDocument();
  });

  describe("when isGettingCountries is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isGettingCountries: true,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("does not render select", () => {
      expect(queryByText(countries.US)).not.toBeInTheDocument();
    });

    it("disables the next button", () => {
      expect(getByText("Next")).toBeDisabled();
    });
  });

  describe("when isSetting is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isSetting: true,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("disables next button", () => {
      expect(queryByText("Next")).toBeDisabled();
    });
  });

  describe("when getCountriesError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        getCountriesError: true,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.GetCountries)).toBeInTheDocument();
    });
  });

  describe("when setError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        setError: true,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.SetCountry)).toBeInTheDocument();
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

      rerender(<CountryPage {...defaultProps} />);
    });

    it("renders skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  });

  describe("when countries are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        countries: { ...countries },
        isGettingCountries: false,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("calls setCountryAndTimezone with correct country and timezone on next button click", () => {
      fireEvent.click(getByText("Next"));

      expect(defaultProps.setCountryAndTimezone).toHaveBeenCalledWith(
        defaultProps.currentCountryCode,
        defaultProps.currentTimezoneCode
      );
    });

    it("renders correct select options", async () => {
      openReactSelectMenu(countryPage, "United States of America");

      Object.keys(defaultProps.countries).forEach((countryCode) => {
        // exclude US as it is already in the select input
        if (countryCode === "US") return;

        expect(queryByText(getName(countryCode)!)).toBeInTheDocument();
      });
    });

    describe("when currentCountryCode is passed", () => {
      let currentCountryCode: string;
      beforeEach(() => {
        currentCountryCode = "GB";

        defaultProps = {
          ...defaultProps,
          currentCountryCode,
        };

        rerender(<CountryPage {...defaultProps} />);
      });

      it("renders current country as selected option", () => {
        expect(queryByText(getName(currentCountryCode)!)).toBeInTheDocument();
      });

      it("calls setCountryAndTimezone with correct country and timezone on next click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setCountryAndTimezone).toHaveBeenCalledWith(
          currentCountryCode,
          defaultProps.currentTimezoneCode
        );
      });
    });

    describe("when new country is selected", () => {
      let selectedCountry: string;
      beforeEach(() => {
        selectedCountry = "GB";

        openReactSelectMenu(
          countryPage,
          getName(defaultProps.currentCountryCode)!
        );

        fireEvent.click(getByText(getName(selectedCountry)!));
      });

      it("calls setCountryAndTimezone with correct country and timezone on next button click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setCountryAndTimezone).toHaveBeenCalledWith(
          selectedCountry,
          defaultProps.currentTimezoneCode
        );
      });
    });
  });

  describe("when timezones are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        timezones: [...timezones],
        isGettingCountries: false,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    it("renders current timezone as selected option", () => {
      expect(
        queryByText(createLabelFromTimezone(defaultProps.currentTimezoneCode))
      ).toBeInTheDocument();
    });

    it("renders timezones related to current country", () => {
      openReactSelectMenu(
        countryPage,
        createLabelFromTimezone(defaultProps.currentTimezoneCode)
      );

      timezones
        .filter(
          ({ countryCode }) => countryCode === defaultProps.currentCountryCode
        )
        .forEach(({ timezone }) => {
          // ignore currently selected timezone
          if (timezone === defaultProps.currentTimezoneCode) return;

          expect(
            queryByText(createLabelFromTimezone(timezone))
          ).toBeInTheDocument();
        });
    });

    it("does not render timezones unrelated to current country", () => {
      openReactSelectMenu(
        countryPage,
        createLabelFromTimezone(defaultProps.currentTimezoneCode)
      );

      timezones
        .filter(
          ({ countryCode }) => countryCode !== defaultProps.currentCountryCode
        )
        .forEach(({ timezone }) => {
          expect(
            queryByText(createLabelFromTimezone(timezone))
          ).not.toBeInTheDocument();
        });
    });

    describe("when new timezone is selected", () => {
      let selectedTimezone: string;
      beforeEach(() => {
        selectedTimezone = "America/Detroit";

        openReactSelectMenu(
          countryPage,
          createLabelFromTimezone(defaultProps.currentTimezoneCode)
        );

        fireEvent.click(getByText(createLabelFromTimezone(selectedTimezone)));
      });

      it("calls setLocale with correct timezone on next button click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setCountryAndTimezone).toHaveBeenCalledWith(
          defaultProps.currentCountryCode,
          selectedTimezone
        );
      });
    });
  });

  describe("when countries and timezones are passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        countries: { ...countries },
        timezones: [...timezones],
        isGettingCountries: false,
      };

      rerender(<CountryPage {...defaultProps} />);
    });

    describe("when new country is selected", () => {
      let selectedCountry: string;
      beforeEach(() => {
        selectedCountry = "GB";

        openReactSelectMenu(
          countryPage,
          getName(defaultProps.currentCountryCode)!
        );

        fireEvent.click(getByText(getName(selectedCountry)!));
      });

      it("selects a timezone from the new country", () => {
        expect(
          queryByText(createLabelFromTimezone("Europe/London"))
        ).toBeInTheDocument();
      });

      it("renders timezones related to current country", () => {
        openReactSelectMenu(
          countryPage,
          createLabelFromTimezone("Europe/London")
        );

        timezones
          .filter(({ countryCode }) => countryCode === selectedCountry)
          .forEach(({ timezone }) => {
            // ignore currently selected timezone
            if (timezone === "Europe/London") return;

            expect(
              queryByText(createLabelFromTimezone(timezone))
            ).toBeInTheDocument();
          });
      });

      it("calls setCountryAndTimezone with correct country and timezone on next button click", () => {
        fireEvent.click(getByText("Next"));

        expect(defaultProps.setCountryAndTimezone).toHaveBeenCalledWith(
          selectedCountry,
          "Europe/London"
        );
      });
    });
  });
});
