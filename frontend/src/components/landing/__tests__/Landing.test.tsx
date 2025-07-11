import React from "react";
import { fireEvent, render, wait } from "@testing-library/react";

import Landing, { Props } from "../Landing";
import LandingTabTemplate from "../../landingTabTemplate/LandingTabTemplate";
import stopFirstBootAppAutostart from "../../../services/stopFirstBootAppAutostart";

jest.mock("../../../services/stopFirstBootAppAutostart");

const stopFirstBootAppAutostartMock = stopFirstBootAppAutostart as jest.Mock;

const firstTabContent = {
  title: "This is the title of the first tab",
  id: "kb",
  templateTitle: "This is the title for the first tab",
  urlInfo: {
    defaultUrl: "https://www.pi-top.com",
    onWebRenderer: jest.fn(),
  },
  message: "A message for the first",
  prompt: <>This is a <span className="green">prompt</span></>,
  image: "Any image"
}

const secondTabContent = {
  title: "This is another title",
  id: "sdk",
  templateTitle: "This is title for the second tab",
  urlInfo: {
    defaultUrl: "https://further.pi-top.com",
    onWebRenderer: jest.fn(),
  },
  message: "This is the message for the second tab",
  prompt: <>This is the prompt for the <span className="green">second</span> tab</>,
  image: "Second image"
}

const tabs = {
  kb: {
    title: firstTabContent.title,
    id: firstTabContent.id,
    detail: (
      <LandingTabTemplate
        key={firstTabContent.id}
        title={firstTabContent.templateTitle}
        urlInfo={firstTabContent.urlInfo}
        message={firstTabContent.message}
        prompt={firstTabContent.prompt}
        image={firstTabContent.image}
      />
    )
  },
  sdk: {
    title: secondTabContent.title,
    id: secondTabContent.id,
    detail: (
      <LandingTabTemplate
        key={secondTabContent.id}
        title={secondTabContent.templateTitle}
        urlInfo={secondTabContent.urlInfo}
        message={secondTabContent.message}
        prompt={secondTabContent.prompt}
        image={secondTabContent.image}
      />
    )
  }
}

describe("Landing", () => {
  let layout: HTMLElement;
  let defaultProps: Props;
  let queryByAltText: any;
  let queryByText: any;
  let getByText: any;
  let rerender: any;

  beforeEach(() => {
    stopFirstBootAppAutostartMock.mockResolvedValue("OK");

    defaultProps = {
      tabs: tabs,
      selectedTabId: "kb",
      onSelectTab: jest.fn(),
    };

    ({
      container: layout,
      queryByAltText,
      queryByText,
      getByText,
      rerender,
    } = render(<Landing {...defaultProps} />));
  });

  it("renders the list of tabs", () => {
    expect(layout.querySelector(".landingList")).toBeInTheDocument();
  });

  it("renders all the provided tabs in the list of tabs", () => {
    Object.values(tabs).forEach((tab) => {
      expect(queryByText(tab.title)).toBeInTheDocument()
    });
  });

  it("first element of the list is set as active in the list of tabs", () => {
    expect(layout.querySelector(".selectedElement")).toHaveTextContent(firstTabContent.title);
  });

  it("only one element of the list is set as active", () => {
    expect(layout.querySelectorAll(".selectedElement").length).toBe(1)
  });

  it("renders the active tab image", () => {
    expect(queryByAltText("banner")).toMatchSnapshot();
  });

  it("renders the active tab message", () => {
    expect(getByText(firstTabContent.message)).toBeInTheDocument();
  });

  it("renders the active tab prompt", () => {
    expect(layout.querySelector(".prompt")).toMatchSnapshot();
  });

  it("stops landing from autostarting on boot", () => {
    expect(stopFirstBootAppAutostartMock).toHaveBeenCalled();
  });

  describe("when a different tab is selected", () => {
    beforeEach(async () => {
      rerender(
        <Landing
          {...defaultProps}
          selectedTabId="sdk"
        />
      );
      await wait();
    });

    it("calls onSelectTab with the correct id when clicking another tab", async () => {
      fireEvent.click(getByText(firstTabContent.title));
      await wait();

      expect(defaultProps.onSelectTab).toHaveBeenCalledWith("kb");
    });

    it("clicked tab is set as active in the list of tabs", () => {
      expect(layout.querySelector(".selectedElement")).toHaveTextContent(secondTabContent.title);
    });

    it("only one element of the list is set as active", () => {
      expect(layout.querySelectorAll(".selectedElement").length).toBe(1)
    });

    it("renders the selected tab image", () => {
      expect(queryByAltText("banner")).toMatchSnapshot();
    });

    it("renders the selected tab message", () => {
      expect(getByText(secondTabContent.message)).toBeInTheDocument();
    });

    it("renders the selected tab prompt", () => {
      expect(layout.querySelector(".prompt")).toMatchSnapshot();
    });
  });
});
