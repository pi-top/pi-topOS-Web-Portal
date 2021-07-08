import {
  render,
  RenderResult,
  waitForElement,
  wait,
  queryByText,
  getByText,
} from "@testing-library/react";


import AboutPageContainer, { Props } from "../AboutPageContainer";
import querySpinner from "../../../../test/helpers/querySpinner";
import { ErrorMessage } from "../AboutPage";

import getAboutDevice from "../../../services/getAboutDevice";

jest.mock("../../../services/getAboutDevice");
const getAboutDeviceMock = getAboutDevice as jest.Mock;

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


describe("AboutPageContainer", () => {
  let defaultProps: Props;
  let mount: (props?: Props) => RenderResult;

  beforeEach(async () => {
    getAboutDeviceMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn()
    };

    mount = (props = defaultProps) => {
      return render(<AboutPageContainer {...props} />);
    };
  });

  afterEach(() => {
    getAboutDeviceMock.mockRestore();
  });

  it("renders the correct banner image", async () => {
    const { queryByAltText } = mount();
    await wait();

    expect(queryByAltText("about-screen")).toMatchSnapshot();

    await wait();
  });

  it("renders device information correctly", async () => {
    const { container: aboutPage } = mount();
    await wait();

    const prompt = aboutPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();

    await wait();
  });

  it("Next button is hidden", async () => {
    const { getByText } = mount();

    expect(getByText("Next")).toHaveProperty("hidden", true);

    await wait();
  });

  it("Skip button is not present", async () => {
    const { queryByText } = mount();

    expect(queryByText("Skip")).not.toBeInTheDocument();

    await wait();
  });

  it("requests device information", async () => {
    const { } = mount();
    await wait();

    expect(getAboutDeviceMock).toHaveBeenCalled();

    await wait();
  });

  it("renders the spinner when waiting device information", async () => {
    getAboutDeviceMock.mockImplementationOnce(async () => await sleep(500))
    const { container: aboutPage, getByText } = mount();

    await waitForElement(() => querySpinner(aboutPage));
    expect(querySpinner(aboutPage)).toBeInTheDocument();

    await wait();
  });

  it("doesn't render spinner when device information is received", async () => {
    const { container: aboutPage } = mount();
    await wait();

    expect(querySpinner(aboutPage)).not.toBeInTheDocument();

    await wait();
  });

  it("when there's an error getting device information, renders the error message", async () => {
    getAboutDeviceMock.mockRejectedValue(
      new Error("oh oh, something happened")
    );

    const { getByText } = mount();
    await wait();

    await waitForElement(() => getByText(ErrorMessage.GenericError));
  });
});
