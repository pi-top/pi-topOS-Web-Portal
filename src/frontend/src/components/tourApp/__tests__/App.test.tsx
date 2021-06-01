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
import { PageRoute } from "../../../types/Page";
import queryReactSelect from "../../../../test/helpers/queryReactSelect";


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

  afterEach(() => cleanup());

  it("renders TourSpashPage by default", async () => {
    const { queryByAltText, waitForSplashPage } = mount();
    await waitForSplashPage();

    expect(queryByAltText("tour-intro-screen")).toBeInTheDocument();
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
