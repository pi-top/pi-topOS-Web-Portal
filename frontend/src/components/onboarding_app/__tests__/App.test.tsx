import React from "react";
import {
  cleanup,
  render,
  wait,
  fireEvent,
  waitForElement,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import { getName } from "country-list";
import { Server } from "mock-socket";

import App from "../App";
import { BuildInfo } from "../../../types/Build";
import { createLocaleFromCode } from "../../../helpers/locales";
import Messages from "../../../pages/upgradePage/__tests__/data/socketMessages.json";
import { PageRoute } from "../../../types/Page";
import { KeyCode } from "../../../../test/types/Keys";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";

import getBuildInfo from "../../../services/getBuildInfo";
import getLocales from "../../../services/getLocales";
import getCurrentLocale from "../../../services/getCurrentLocale";
import setLocale from "../../../services/setLocale";
import getCountries from "../../../services/getCountries";
import setCountry from "../../../services/setCountry";
import getCurrentCountry from "../../../services/getCurrentCountry";
import getTimezones from "../../../services/getTimezones";
import getCurrentTimezone from "../../../services/getCurrentTimezone";
import setTimezone from "../../../services/setTimezone";
import getKeyboards from "../../../services/getKeyboards";
import getKeyboardVariants from "../../../services/getKeyboardVariants";
import getCurrentKeyboard from "../../../services/getCurrentKeyboard";
import setKeyboard from "../../../services/setKeyboard";
import setRegistration from "../../../services/setRegistration";
import getAvailableSpace from "../../../services/getAvailableSpace";
import isConnectedToNetwork from "../../../services/isConnectedToNetwork";
import serverStatus from "../../../services/serverStatus";
import restartWebPortalService from "../../../services/restartWebPortalService";
import isConnectedThroughAp from "../../../services/isConnectedThroughAp";
import isOnOpenboxSession from "../../../services/isOnOpenboxSession";

import { waitFor } from "../../../../test/helpers/waitFor";
import wsBaseUrl from "../../../services/wsBaseUrl";

jest.mock("../../../services/isConnectedToNetwork");
jest.mock("../../../services/getBuildInfo");
jest.mock("../../../services/getLocales");
jest.mock("../../../services/getCurrentLocale");
jest.mock("../../../services/setLocale");
jest.mock("../../../services/getCountries");
jest.mock("../../../services/getTimezones");
jest.mock("../../../services/getCurrentCountry");
jest.mock("../../../services/getCurrentTimezone");
jest.mock("../../../services/setCountry");
jest.mock("../../../services/setTimezone");
jest.mock("../../../services/getKeyboards");
jest.mock("../../../services/getKeyboardVariants");
jest.mock("../../../services/getCurrentKeyboard");
jest.mock("../../../services/setKeyboard");
jest.mock("../../../services/setRegistration");
jest.mock("../../../services/getAvailableSpace");
jest.mock("../../../services/serverStatus");
jest.mock("../../../services/restartWebPortalService");
jest.mock("../../../services/isConnectedThroughAp");
jest.mock("../../../services/isOnOpenboxSession");

const getBuildInfoMock = getBuildInfo as jest.Mock;
const getLocalesMock = getLocales as jest.Mock;
const currentLocaleMock = getCurrentLocale as jest.Mock;
const setLocaleMock = setLocale as jest.Mock;
const getKeyboardsMock = getKeyboards as jest.Mock;
const getKeyboardVariantsMock = getKeyboardVariants as jest.Mock;
const currentKeyboardMock = getCurrentKeyboard as jest.Mock;
const setKeyboardMock = setKeyboard as jest.Mock;
const getCountriesMock = getCountries as jest.Mock;
const getTimezonesMock = getTimezones as jest.Mock;
const currentCountryMock = getCurrentCountry as jest.Mock;
const getCurrentTimezoneMock = getCurrentTimezone as jest.Mock;
const setCountryMock = setCountry as jest.Mock;
const setCurrentTimezone = setTimezone as jest.Mock;
const setRegistrationMock = setRegistration as jest.Mock;
const isConnectedToNetworkMock = isConnectedToNetwork as jest.Mock;
const getAvailableSpaceMock = getAvailableSpace as jest.Mock;
const serverStatusMock = serverStatus as jest.Mock;
const restartWebPortalServiceMock = restartWebPortalService as jest.Mock;
const isConnectedThroughApMock = isConnectedThroughAp as jest.Mock;
const isOnOpenboxSessionMock = isOnOpenboxSession as jest.Mock;

const keyboardVariants = {
  us: {
    "alt-intl": "Alternative international (former us_intl)",
    "altgr-intl": "International (AltGr dead keys)",
    chr: "Cherokee",
    colemak: "Colemak",
    dvorak: "Dvorak",
    "dvorak-classic": "Classic Dvorak",
    "dvorak-intl": "Dvorak international",
    "dvorak-l": "Left handed Dvorak",
    "dvorak-r": "Right handed Dvorak",
    dvp: "Programmer Dvorak",
    euro: "With EuroSign on 5",
    intl: "International (with dead keys)",
    mac: "Macintosh",
    olpc2: "Group toggle on multiply/divide key",
    rus: "Russian phonetic",
    srp: "Serbian",
  },
};

const buildInfo: BuildInfo = {
  buildRepo: "experimental-pkgcld",
  buildDate: "2021-08-09",
  buildNumber: "100",
  buildCommit: "07706af4337c60f4007ef9910c33c6e4daab1646",
};

const mount = (pageRoute: PageRoute = PageRoute.Splash) => {
  const result = render(
    <MemoryRouter initialEntries={[pageRoute]}>
      <App />
    </MemoryRouter>
  );

  const waitForAltText = (altText: string) =>
    waitForElement(() => result.getByAltText(altText));

  return {
    ...result,
    // queries
    queryReactSelect: () => queryReactSelect(result.container),
    // WaitFors
    waitForSplashPage: () => waitForAltText("intro-screen"),
    waitForLanguagePage: () => waitForAltText("language-screen-banner"),
    waitForCountryPage: () => waitForAltText("country-screen"),
    waitForKeyboardPage: () => waitForAltText("keyboard-screen"),
    waitForTermsPage: () => waitForAltText("terms-screen-banner"),
    waitForWifiPage: () => waitForAltText("wifi-page-banner"),
    waitForUpgradePage: () => waitForAltText("upgrade-page-banner"),
    waitForUpgradePageBanner: () => waitForAltText("upgrade-page-banner"),
    waitForRegistrationPage: () => waitForAltText("registration-screen-banner"),
    waitForFinalOnboardingPage: () => waitForAltText("final-screen"),
    waitForRestartPage: () => waitForAltText("reboot-screen"),
    // Actions
    registerEmail: (email: string) => {
      const emailInput = result.getByPlaceholderText(
        "Please enter your email..."
      );
      fireEvent.change(emailInput, {
        target: { value: email },
      });
      fireEvent.submit(result.container.querySelector("#registration-form")!);
    },
  };
};

describe("App", () => {
  let server: Server;

  beforeEach(() => {
    // app services
    getBuildInfoMock.mockResolvedValue(buildInfo);

    // language page services
    const currentLocale = createLocaleFromCode("en_GB");
    getLocalesMock.mockResolvedValue([currentLocale]);
    currentLocaleMock.mockResolvedValue(currentLocale.localeCode);
    setLocaleMock.mockResolvedValue("OK");
    getAvailableSpaceMock.mockResolvedValue(
      Messages.Size.payload.size.requiredSpace +
        Messages.Size.payload.size.downloadSize +
        1000
    );

    const countries = {
      US: getName("US")!,
      GB: getName("GB")!,
    };
    getCountriesMock.mockResolvedValue(countries);
    currentCountryMock.mockResolvedValue("");
    getTimezonesMock.mockResolvedValue([
      {
        countryCode: "GB",
        timezone: "GMT+0000",
      },
    ]);
    getCurrentTimezoneMock.mockResolvedValue("GMT+0000");
    setCurrentTimezone.mockResolvedValue("OK");
    setCountryMock.mockResolvedValue("OK");
    getKeyboardsMock.mockResolvedValue({ us: "United States" });
    getKeyboardVariantsMock.mockResolvedValue(keyboardVariants);
    currentKeyboardMock.mockResolvedValue({ layout: "us" });
    setKeyboardMock.mockResolvedValue("OK");
    setRegistrationMock.mockResolvedValue("OK");
    isConnectedToNetworkMock.mockResolvedValue({ connected: true });
    isConnectedThroughApMock.mockResolvedValue({ isUsingAp: false });

    // upgrade page mocks
    serverStatusMock.mockResolvedValue("OK");
    restartWebPortalServiceMock.mockResolvedValue("OK");

    // asume we're not on openbox session; this is the default for the new 'no onboarding' flow
    isOnOpenboxSessionMock.mockResolvedValue(false);

    server = new Server(`${wsBaseUrl}/os-upgrade`);
    server.on("connection", (socket) => {
      socket.on("message", (data) => {
        if (data === "update_sources") {
          // return an error to be able to interact with the page
          socket.send(JSON.stringify(Messages.UpdateSourcesError));
        }
        if (data === "state") {
          socket.send(JSON.stringify(Messages.StateNotBusy));
        }
      });
    });
  });

  afterEach(() => {
    act(() => server.close());
    cleanup();
    jest.useRealTimers();
  });

  it("does not render build information on mount", async () => {
    const { queryByTestId } = mount();

    expect(queryByTestId("build-info")).not.toBeInTheDocument();

    await wait();
  });

  it("renders build information correctly when loaded", async () => {
    const { queryByTestId, waitForSplashPage } = mount();
    await waitForSplashPage();

    expect(queryByTestId("build-info")).toMatchSnapshot();
  });

  it("renders SpashPage by default", async () => {
    const { queryByAltText, waitForSplashPage } = mount();
    await waitForSplashPage();

    expect(queryByAltText("intro-screen")).toBeInTheDocument();
  });

  it("when using AP mode, displays reconnect to AP dialog", async () => {
    jest.useFakeTimers();
    jest.setTimeout(30_000);
    isConnectedThroughApMock.mockResolvedValue({ isUsingAp: true });

    const {
      getByText,
      getByTestId,
      waitForSplashPage,
      waitForLanguagePage,
      waitForCountryPage,
      waitForWifiPage,
      waitForUpgradePage,
      waitForRegistrationPage,
      waitForFinalOnboardingPage,
    } = mount();

    const checkForDialog = async () => {
      await act(async () => {
        jest.useFakeTimers();

        expect(getByTestId("reconnect-ap-dialog")).toHaveClass("hidden");

        serverStatusMock.mockRejectedValue("Error");
        // Advance time to wait for 3 failed requests for dialog to appear
        jest.advanceTimersByTime(11_000);
        jest.useRealTimers();
        await waitFor(
          () =>
            expect(getByTestId("reconnect-ap-dialog")).not.toHaveClass(
              "hidden"
            ),
          { timeout: 10_000 }
        );

        serverStatusMock.mockResolvedValue("OK");
        // Advance time and wait for dialog to dissapear
        jest.useFakeTimers();
        jest.advanceTimersByTime(1_000);
        jest.useRealTimers();
        await waitFor(
          () =>
            expect(getByTestId("reconnect-ap-dialog")).toHaveClass("hidden"),
          { timeout: 10_000 }
        );

        jest.useRealTimers();
      });
    };

    // on splash page
    await waitForSplashPage();
    await checkForDialog();
    fireEvent.click(getByText("Yes"));

    // on language page
    await waitForLanguagePage();
    await checkForDialog();
    fireEvent.click(getByText("Next"));

    // on country page
    await waitForCountryPage();
    await checkForDialog();
    fireEvent.click(getByText("Next"));

    // on wifi page
    await waitForWifiPage();
    await checkForDialog();
    fireEvent.click(getByText("Next"));

    // on upgrade page
    await waitForUpgradePage();
    await waitFor(() => expect(getByText("Skip")).toBeInTheDocument());
    fireEvent.click(getByText("Skip"));

    // on registration page
    await waitForRegistrationPage();
    await checkForDialog();
    fireEvent.click(getByText("Skip"));

    // on restart page
    await waitForFinalOnboardingPage();

    // dialog is NOT displayed on this page
    expect(await getByTestId("reconnect-ap-dialog")).toHaveClass("hidden");

    serverStatusMock.mockRejectedValue("Error");
    await new Promise((r) => setTimeout(r, 1000));
    expect(await getByTestId("reconnect-ap-dialog")).toHaveClass("hidden");

    serverStatusMock.mockResolvedValue("OK");
    await new Promise((r) => setTimeout(r, 1000));
    expect(await getByTestId("reconnect-ap-dialog")).toHaveClass("hidden");
  });

  describe("SplashPage", () => {
    it("navigates to LanguagePage on next button click", async () => {
      const { getByText, waitForSplashPage, waitForLanguagePage } = mount(
        PageRoute.Splash
      );
      await waitForSplashPage();

      fireEvent.click(getByText("Yes"));
      await waitForLanguagePage();
    });
  });

  describe("LanguagePage", () => {
    it("navigates to CountryPage on next button click", async () => {
      const { getByText, waitForLanguagePage, waitForCountryPage } = mount(
        PageRoute.Language
      );
      await waitForLanguagePage();

      fireEvent.click(getByText("Next"));
      await waitForCountryPage();
    });

    it("if already completed it allows skipping to CountryScreen", async () => {
      const { getByText, waitForLanguagePage, waitForCountryPage } = mount(
        PageRoute.Language
      );
      await waitForLanguagePage();

      // complete LanguagePage and go to CountryPage
      fireEvent.click(getByText("Next"));
      await waitForCountryPage();

      // go back to LanguagePage
      fireEvent.click(getByText("Back"));
      await waitForLanguagePage();

      // skip to CountryPage
      fireEvent.click(getByText("Skip"));
      await waitForCountryPage();
    });
  });

  describe("CountryPage", () => {
    it("selects expected user country by default", async () => {
      // Enter in at LanguagePage so expected user country is set
      const { getByText, waitForLanguagePage, waitForCountryPage } = mount(
        PageRoute.Language
      );
      await waitForLanguagePage();

      fireEvent.click(getByText("Next"));
      await waitForCountryPage();

      expect(getByText(getName("GB")!)).toBeInTheDocument();
    });

    it("navigates to WifiPage on next button click", async () => {
      const { getByText, waitForCountryPage, waitForWifiPage } = mount(
        PageRoute.Country
      );
      await waitForCountryPage();

      fireEvent.click(getByText("Next"));
      await waitForWifiPage();
    });

    it("navigate to LanguagePage on back button click", async () => {
      const { getByText, waitForCountryPage, waitForLanguagePage } = mount(
        PageRoute.Country
      );
      await waitForCountryPage();

      fireEvent.click(getByText("Back"));
      await waitForLanguagePage();
    });

    it("allows skipping to WifiPage when already completed", async () => {
      const { getByText, waitForCountryPage, waitForWifiPage } = mount(
        PageRoute.Country
      );
      await waitForCountryPage();

      // complete CountryPage by navigating to WifiPage
      fireEvent.click(getByText("Next"));
      await waitForWifiPage();

      // go back to CountryPage
      fireEvent.click(getByText("Back"));
      await waitForCountryPage();

      // skip to WifiPage
      fireEvent.click(getByText("Skip"));
      await waitForWifiPage();
    });
  });

  describe("WifiPage", () => {
    it("navigates to UpgradePage on next button click", async () => {
      const { getByText, waitForWifiPage, waitForUpgradePage } = mount(
        PageRoute.Wifi
      );
      await waitForWifiPage();

      fireEvent.click(getByText("Next"));
      await waitForUpgradePage();
    });

    it("navigates to CountryPage on back button click", async () => {
      const { getByText, waitForWifiPage, waitForCountryPage } = mount(
        PageRoute.Wifi
      );
      await waitForWifiPage();

      fireEvent.click(getByText("Back"));
      await waitForCountryPage();
    });

    it("allows skipping to UpgradePage if already completed", async () => {
      const { getByText, getAllByText, waitForWifiPage, waitForUpgradePage } =
        mount(PageRoute.Wifi);
      await waitForWifiPage();

      // complete WifiPage by navigating to UpgradePage
      fireEvent.click(getByText("Next"));
      await waitForUpgradePage();

      // go back to WifiPage
      await waitFor(() => expect(getByText("Back")).toBeInTheDocument());
      fireEvent.click(getByText("Back"));
      await waitForWifiPage();

      // skip to UpgradePage
      const [mainSkip, warningDialogSkip] = getAllByText("Skip");
      fireEvent.click(mainSkip);
      fireEvent.click(warningDialogSkip);
      await waitForUpgradePage();
    });

    describe("when not connected to internet", () => {
      beforeEach(() => {
        isConnectedToNetworkMock.mockResolvedValue({ connected: false });
      });
      afterEach(() => {
        isConnectedToNetworkMock.mockResolvedValue({ connected: true });
      });

      it("it navigates to UpgradePage on Next button click after succesfully joining", async () => {
        const {
          getByText,
          waitForWifiPage,
          waitForUpgradePage,
          queryReactSelect,
        } = mount(PageRoute.Wifi);
        await waitForWifiPage();
        await waitFor(() =>
          expect(getByText("Please select WiFi network...")).toBeInTheDocument()
        );
        fireEvent.keyDown(queryReactSelect()!, {
          keyCode: KeyCode.DownArrow,
        });

        fireEvent.click(getByText("Depto 606"));
        fireEvent.click(getByText("Join"));
        await waitFor(() => expect(getByText("We've connected successfully.")).toBeInTheDocument());
        await waitFor(() => expect(getByText("OK")).toBeInTheDocument());
        fireEvent.click(getByText("OK"));

        await waitForUpgradePage();
      });

      it("navigates to RegistrationPage on skip warning dialog skip button click", async () => {
        const { getAllByText, waitForWifiPage, waitForRegistrationPage } =
          mount(PageRoute.Wifi);
        await waitForWifiPage();

        const [mainSkip, warningDialogSkip] = getAllByText("Skip");
        fireEvent.click(mainSkip);
        fireEvent.click(warningDialogSkip);
        await waitForRegistrationPage();
      });
    });
  });

  describe("UpgradePage", () => {
    it("navigates to RegistrationPage on next button click", async () => {
      const {
        getByText,
        waitForUpgradePage,
        waitForRegistrationPage,
      } = mount(PageRoute.Upgrade);
      await waitForUpgradePage();

      await waitFor(() => expect(getByText("Skip")).toBeInTheDocument());
      fireEvent.click(getByText("Skip"));
      await waitForRegistrationPage();
    });

    it("navigates to WifiPage on back button click", async () => {
      const { getByText, waitForUpgradePage, waitForWifiPage } = mount(
        PageRoute.Upgrade
      );
      await waitForUpgradePage();

      await waitFor(() => expect(getByText("Back")).toBeInTheDocument());
      fireEvent.click(getByText("Back"));
      await waitForWifiPage();
    });

    it("allows skipping to RegistrationScreen when already completed", async () => {
      const {
        getByText,
        waitForUpgradePage,
        waitForRegistrationPage,
        waitForUpgradePageBanner,
      } = mount(PageRoute.Upgrade);
      await waitForUpgradePage();

      // go to RegistrationPage
      await waitFor(() => expect(getByText("Skip")).toBeInTheDocument());
      fireEvent.click(getByText("Skip"));
      await waitForRegistrationPage();

      // go back to UpgradePage
      fireEvent.click(getByText("Back"));
      await waitForUpgradePageBanner();

      // Skip to RegistrationPage
      fireEvent.click(getByText("Skip"));
      await waitForRegistrationPage();
    });
  });

  describe("RegistrationPage", () => {
    it("navigates to FinalOnboardingPage on next button click", async () => {
      const { waitForRegistrationPage, registerEmail, waitForFinalOnboardingPage } =
        mount(PageRoute.Registration);
      await waitForRegistrationPage();

      await registerEmail("test@test.com");
      await waitForFinalOnboardingPage();
    });

    it("navigates to FinalOnboardingPage on skip button click", async () => {
      const { getByText, waitForRegistrationPage, waitForFinalOnboardingPage } = mount(
        PageRoute.Registration
      );
      await waitForRegistrationPage();

      fireEvent.click(getByText("Skip"));
      await waitForFinalOnboardingPage();
    });

    it("if on openbox session, navigates to RestartPage on next button click", async () => {
      isOnOpenboxSessionMock.mockResolvedValue(true);
      const { waitForRegistrationPage, registerEmail, waitForRestartPage } =
        mount(PageRoute.Registration);
      await waitForRegistrationPage();

      await registerEmail("test@test.com");
      await waitForRestartPage();
    });

    it("if on openbox session, navigates to RestartPage on skip button click", async () => {
      isOnOpenboxSessionMock.mockResolvedValue(true);
      const { getByText, waitForRegistrationPage, waitForRestartPage } = mount(
        PageRoute.Registration
      );
      await waitForRegistrationPage();

      fireEvent.click(getByText("Skip"));
      await waitForRestartPage();
    });

    it("navigates to UpgradePage on back button click when connected", async () => {
      const { getByText, waitForRegistrationPage, waitForUpgradePageBanner } =
        mount(PageRoute.Registration);
      await waitForRegistrationPage();

      fireEvent.click(getByText("Back"));
      await waitForUpgradePageBanner();
    });

    it("navigates to WifiPage on back button click when not connected", async () => {
      // Entering at wifi page to complete the "no internet connection" flow
      isConnectedToNetworkMock.mockResolvedValueOnce({ connected: false });

      const {
        getByText,
        getAllByText,
        waitForWifiPage,
        waitForRegistrationPage,
      } = mount(PageRoute.Wifi);
      await waitForWifiPage();

      const [mainSkip, warningDialogSkip] = getAllByText("Skip");
      fireEvent.click(mainSkip);
      fireEvent.click(warningDialogSkip);
      await waitForRegistrationPage();

      fireEvent.click(getByText("Back"));
      await waitForWifiPage();
    });

    it("retains user email address after navigating away", async () => {
      const {
        getByText,
        waitForRegistrationPage,
        waitForFinalOnboardingPage,
        registerEmail,
        queryByDisplayValue,
      } = mount(PageRoute.Registration);
      await waitForRegistrationPage();

      await registerEmail("test@test.com");
      await waitForFinalOnboardingPage();

      fireEvent.click(getByText("Back"));
      await wait();

      expect(queryByDisplayValue("test@test.com")).toBeInTheDocument();
    });
  });

  describe("FinalOnboardingPage", () => {
    it("navigates to RegistrationPage on back button click", async () => {
      const { getByText, waitForFinalOnboardingPage, waitForRegistrationPage } = mount(
        PageRoute.Finish
      );
      await waitForFinalOnboardingPage();

      fireEvent.click(getByText("Back"));
      await waitForRegistrationPage();
    });

    it("navigates to LandingPage on finish button click", async () => {
      window.location.reload = jest.fn();

      const { getByText, waitForFinalOnboardingPage } = mount(PageRoute.Finish);
      await waitForFinalOnboardingPage();

      fireEvent.click(getByText("Finish"));

      // window.location.reload should be called
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});
