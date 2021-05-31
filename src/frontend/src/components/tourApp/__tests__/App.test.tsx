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

import TourApp from "../App";
import { BuildInfo } from "../../../types/Build";
import { PageRoute } from "../../../types/Page";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";

import getBuildInfo from "../../../services/getBuildInfo";
import getPythonSDKDocsUrl from "../../../services/getPythonSDKDocsUrl";
import getFurtherUrl from "../../../services/getFurtherUrl";

jest.mock("../../../services/getBuildInfo");
jest.mock("../../../services/getPythonSDKDocsUrl");
jest.mock("../../../services/getFurtherUrl");

const getBuildInfoMock = getBuildInfo as jest.Mock;
const getPythonSDKDocsUrlMock = getPythonSDKDocsUrl as jest.Mock;
const getFurtherUrlMock = getFurtherUrl as jest.Mock;

const buildInfo: BuildInfo = {
  buildName: "test-build",
  buildNumber: "1234567890",
  buildDate: "01/01/2020",
  buildRepo: "test-build-repo",
  finalRepo: "final-test-build-repo",
  buildHash: "094cdf6bc25b7429eb2820528f031afe",
};


const mount = (pageRoute: PageRoute = PageRoute.TourSplash) => {
  const result = render(
    <MemoryRouter initialEntries={[pageRoute]}>
      <TourApp />
    </MemoryRouter>
  );

  const waitForAltText = (altText: string) =>
    waitForElement(() => result.getByAltText(altText));

  return {
    ...result,
    // queries
    queryReactSelect: () => queryReactSelect(result.container),
    // WaitFors
    waitForSplashPage: () => waitForAltText("tour-intro-screen"),
    waitForLinksPage: () => waitForAltText("links-screen-banner"),
  };
};

describe("TourApp", () => {
  beforeAll(() => {
    getBuildInfoMock.mockResolvedValue(buildInfo);
    getPythonSDKDocsUrlMock.mockResolvedValue({url: "http://docs.pi-top.com"});
    getFurtherUrlMock.mockResolvedValue({url: "http://further.pi-top.com"});
  });
  afterEach(() => cleanup());

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

  it("renders TourSpashPage by default", async () => {
    const { queryByAltText, waitForSplashPage } = mount();
    await waitForSplashPage();

    expect(queryByAltText("tour-intro-screen")).toBeInTheDocument();
  });

  it("requests python sdk docs url on mount", async () => {
    const { queryByAltText, waitForSplashPage } = mount();
    await waitForSplashPage();
    expect(getPythonSDKDocsUrl).toHaveBeenCalled()
  });

  it("requests further url on mount", async () => {
    const { queryByAltText, waitForSplashPage } = mount();
    await waitForSplashPage();
    expect(getFurtherUrlMock).toHaveBeenCalled()
  });

  describe("TourSplashPage", () => {
    it("navigates to LinksPage on next button click", async () => {
      const { getByText, waitForSplashPage, waitForLinksPage } = mount(
        PageRoute.TourSplash
      );
      await waitForSplashPage();
      fireEvent.click(getByText("Let's Go"));
      await waitForLinksPage();
    });
  });
});
