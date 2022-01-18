import React from "react";
import { render } from "@testing-library/react";

import Landing, { Props } from "../Landing";
import LandingPageTemplate from "../../../pages/landingPageTemplate/LandingPageTemplate";

const pageContent = {
  title: "This is the title",
  id: "kb",
  templateTitle: "This is the title for the template",
  urlInfo: {
    defaultUrl: "https://www.pi-top.com",
    onWebRenderer: jest.fn(),
  },
  message: "A message",
  prompt: <>This is a <span className="green">prompt</span></>,
  image: "Any image"
}

const landingPages = [
  {
    title: pageContent.title,
    id: pageContent.id,
    detail: (
      <LandingPageTemplate
        key={pageContent.id}
        title={pageContent.templateTitle}
        urlInfo={pageContent.urlInfo}
        message={pageContent.message}
        prompt={pageContent.prompt}
        image={pageContent.image}
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

  it("renders correct image", () => {
    expect(queryByAltText("banner")).toMatchSnapshot();
  });

  it("renders message", () => {
    expect(getByText(pageContent.message)).toBeInTheDocument();
  });

  it("renders prompt", () => {
    const prompt = layout.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

});
