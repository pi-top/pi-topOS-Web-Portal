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
import { getName } from "country-list";
import { act } from "react-dom/test-utils";

import CountryPageContainer, { Props } from "../CountryPageContainer";
import { ErrorMessage } from "../CountryPage";

import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import openReactSelectMenu from "../../../../test/helpers/openReactSelectMenu";

import getCountries from "../../../services/getCountries";
import getTimezones from "../../../services/getTimezones";
import getCurrentCountry from "../../../services/getCurrentCountry";
import getCurrentTimezone from "../../../services/getCurrentTimezone";
import setCountry from "../../../services/setCountry";
import setTimezone from "../../../services/setTimezone";

jest.mock("../../../services/getCountries");
jest.mock("../../../services/getTimezones");
jest.mock("../../../services/getCurrentCountry");
jest.mock("../../../services/getCurrentTimezone");
jest.mock("../../../services/setCountry");
jest.mock("../../../services/setTimezone");

const getCountriesMock = getCountries as jest.Mock;
const getTimezonesMock = getTimezones as jest.Mock;
const currentCountryMock = getCurrentCountry as jest.Mock;
const getCurrentTimezoneMock = getCurrentTimezone as jest.Mock;
const setCountryMock = setCountry as jest.Mock;
const setCurrentTimezone = setTimezone as jest.Mock;

describe("CountryPageContainer", () => {
  let countries: { [code: string]: string };
  let defaultProps: Props;
  let countryPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let rerender: RenderResult["rerender"];
  beforeEach(async () => {
    countries = {
      US: getName("US")!,
      GB: getName("GB")!,
    };

    getCountriesMock.mockResolvedValue(countries);
    currentCountryMock.mockResolvedValue("GB");
    getTimezonesMock.mockResolvedValue([
      {
        countryCode: "GB",
        timezone: "GMT+0000",
      },
    ]);
    getCurrentTimezoneMock.mockResolvedValue("GMT+0000");
    setCurrentTimezone.mockResolvedValue("OK");
    setCountryMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      isCompleted: false,
      defaultCountry: "US",
    };
  });
  afterEach(() => {
    getCountriesMock.mockRestore();
    setCountryMock.mockRestore();
    currentCountryMock.mockRestore();
  });

  it("disables the next button while loading", async () => {
    ({ queryByText } = render(<CountryPageContainer {...defaultProps} />));

    expect(queryByText("Next")).toBeDisabled();

    await wait();
  });

  it("does not render the select while loading", async () => {
    ({ container: countryPageContainer } = render(
      <CountryPageContainer {...defaultProps} />
    ));

    expect(queryReactSelect(countryPageContainer)).not.toBeInTheDocument();

    await wait();
  });

  describe("when getCurrentCountry service fails", () => {
    beforeEach(async () => {
      currentCountryMock.mockRejectedValue(
        new Error("Failed to get current country")
      );

      ({
        container: countryPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<CountryPageContainer {...defaultProps} />));

      await wait();
    });

    it("selects default country", () => {
      expect(queryByText(countries.US)).toBeInTheDocument();
    });

    it("renders countries as options", () => {
      openReactSelectMenu(countryPageContainer, countries.US);

      expect(queryByText(countries.GB)).toBeInTheDocument();
    });
  });

  describe("when getCountries service fails", () => {
    beforeEach(async () => {
      getCountriesMock.mockRejectedValue(new Error("Failed to get countries"));

      ({
        container: countryPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<CountryPageContainer {...defaultProps} />));

      await wait();
    });

    it("renders error message", () => {
      expect(queryByText(ErrorMessage.GetCountries)).toBeInTheDocument();
    });
  });

  describe("when services are successful", () => {
    beforeEach(async () => {
      ({
        container: countryPageContainer,
        queryByText,
        getByText,
        rerender,
      } = render(<CountryPageContainer {...defaultProps} />));

      await wait();
    });

    it("enables next button", () => {
      expect(queryByText("Next")).not.toBeDisabled();
    });

    it("renders current country as selected country", () => {
      expect(queryByText(countries.GB)).toBeInTheDocument();
    });

    it("renders countrys as options", () => {
      openReactSelectMenu(countryPageContainer, countries.GB);

      expect(queryByText(countries.US)).toBeInTheDocument();
    });

    describe("when isCompleted is true", () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          isCompleted: true,
        };
        rerender(<CountryPageContainer {...defaultProps} />);
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

      it("does not call setCountry", () => {
        expect(setCountryMock).not.toHaveBeenCalled();
      });
    });

    describe("when currentCountry does not match selected country", () => {
      let selectedCountry: string;
      beforeEach(() => {
        openReactSelectMenu(countryPageContainer, countries.GB);

        selectedCountry = "US";
        fireEvent.click(getByText(countries.US));
      });

      it("calls setCountry with correct countryCode on next button click", async () => {
        fireEvent.click(getByText("Next"));

        expect(setCountryMock).toHaveBeenCalledWith(selectedCountry);

        await wait();
      });

      it("calls goToNextPage", async () => {
        fireEvent.click(getByText("Next"));
        await wait();

        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });

      describe("when setCountry fails on next button click", () => {
        beforeEach(async () => {
          setCountryMock.mockRejectedValue(new Error("Unable to set country"));

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
