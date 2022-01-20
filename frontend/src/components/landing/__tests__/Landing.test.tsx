import React from "react";
import { fireEvent, getAllByText, render, wait, waitForElement } from "@testing-library/react";

import Landing, { Props } from "../Landing";
import LandingPageTemplate from "../../../pages/landingPageTemplate/LandingPageTemplate";
import stopLandingAutostart from "../../../services/stopLandingAutostart";

jest.mock("../../../services/stopLandingAutostart");

const stopLandingAutostartMock = stopLandingAutostart as jest.Mock;


const firstPageContent = {
  title: "This is the title of the first page",
  id: "kb",
  templateTitle: "This is the title for the first page",
  urlInfo: {
    defaultUrl: "https://www.pi-top.com",
    onWebRenderer: jest.fn(),
  },
  message: "A message for the first",
  prompt: <>This is a <span className="green">prompt</span></>,
  image: "Any image"
}

const secondPageContent = {
  title: "This is another title",
  id: "sdk",
  templateTitle: "This is title for the second page",
  urlInfo: {
    defaultUrl: "https://further.pi-top.com",
    onWebRenderer: jest.fn(),
  },
  message: "This is the message for the second page",
  prompt: <>This is the prompt for the <span className="green">second</span> page</>,
  image: "Second image"
}


const landingPages = [
  {
    title: firstPageContent.title,
    id: firstPageContent.id,
    detail: (
      <LandingPageTemplate
        key={firstPageContent.id}
        title={firstPageContent.templateTitle}
        urlInfo={firstPageContent.urlInfo}
        message={firstPageContent.message}
        prompt={firstPageContent.prompt}
        image={firstPageContent.image}
      />
    )
  },
  {
    title: secondPageContent.title,
    id: secondPageContent.id,
    detail: (
      <LandingPageTemplate
        key={secondPageContent.id}
        title={secondPageContent.templateTitle}
        urlInfo={secondPageContent.urlInfo}
        message={secondPageContent.message}
        prompt={secondPageContent.prompt}
        image={secondPageContent.image}
      />
    )
  },
]

describe("Landing", () => {
  let layout: HTMLElement;
  let defaultProps: Props;
  let queryByAltText: any;
  let queryByText: any;
  let queryByLabelText: any;
  let getByText: any;
  let rerender: any;
  beforeEach(() => {
    stopLandingAutostartMock.mockResolvedValue("OK");

    defaultProps = {
      pages: landingPages,
    };

    ({
      container: layout,
      queryByAltText,
      queryByText,
      queryByLabelText,
      getByText,
      rerender,
    } = render(<Landing {...defaultProps} />));
  });

  it("renders the list of pages", () => {
    expect(layout.querySelector(".landingList")).toBeInTheDocument();
  });

  it("renders all the provided pages in the list of pages", () => {
    landingPages.forEach((page) => {
      expect(queryByText(page.title)).toBeInTheDocument()
    });
  });

  it("first element of the list is set as active in the list of pages", () => {
    expect(layout.querySelector(".selectedElement")).toHaveTextContent(firstPageContent.title);
  });

  it("only one element of the list is set as active", () => {
    expect(layout.querySelectorAll(".selectedElement").length).toBe(1)
  });

  it("renders the active page image", () => {
    expect(queryByAltText("banner")).toMatchSnapshot();
  });

  it("renders the active page message", () => {
    expect(getByText(firstPageContent.message)).toBeInTheDocument();
  });

  it("renders the active page prompt", () => {
    expect(layout.querySelector(".prompt")).toMatchSnapshot();
  });

  it("stops landing from autostarting on boot", () => {
    expect(stopLandingAutostartMock).toHaveBeenCalled();
  });

  describe("when clicking another page from the list", () => {
    beforeEach(async () => {
      fireEvent.click(getByText(secondPageContent.title))
      wait();
    });

    it("clicked page is set as active in the list of pages", () => {
      expect(layout.querySelector(".selectedElement")).toHaveTextContent(secondPageContent.title);
    });

    it("only one element of the list is set as active", () => {
      expect(layout.querySelectorAll(".selectedElement").length).toBe(1)
    });

    it("renders the selected page image", () => {
      expect(queryByAltText("banner")).toMatchSnapshot();
    });

    it("renders the selected page message", () => {
      expect(getByText(secondPageContent.message)).toBeInTheDocument();
    });

    it("renders the selected page prompt", () => {
      expect(layout.querySelector(".prompt")).toMatchSnapshot();
    });
  });

});
