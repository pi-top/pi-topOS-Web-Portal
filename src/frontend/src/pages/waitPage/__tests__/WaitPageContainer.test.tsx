import React from "react";
import {
  render,
  RenderResult,
  waitForElement,
  wait,
  queryByText,
  getByText,
} from "@testing-library/react";


import WaitPageContainer, { Props } from "../WaitPageContainer";
import querySpinner from "../../../../test/helpers/querySpinner";
import { ExplanationMessage, ErrorMessage } from "../WaitPage";

import isFileSystemExpanded from "../../../services/isFileSystemExpanded";
import reboot from "../../../services/reboot";
import expandFileSystem from "../../../services/expandFileSystem";
import enableMouseCursor from "../../../services/enableMouseCursor";
import enablePtSysOled from "../../../services/enablePtSysOled";

jest.mock("../../../services/isFileSystemExpanded");
jest.mock("../../../services/reboot");
jest.mock("../../../services/expandFileSystem");
jest.mock("../../../services/enableMouseCursor");
jest.mock("../../../services/enablePtSysOled");

const isFileSystemExpandedMock = isFileSystemExpanded as jest.Mock;
const rebootMock = reboot as jest.Mock;
const expandFileSystemMock = expandFileSystem as jest.Mock;
const enableMouseCursorMock = enableMouseCursor as jest.Mock;
const enablePtSysOledMock = enableMouseCursor as jest.Mock;

describe("WaitPageContainer", () => {
  let defaultProps: Props;
  let mount: (props?: Props) => RenderResult;

  beforeEach(async () => {
    isFileSystemExpandedMock.mockResolvedValue({ expanded: false });
    rebootMock.mockResolvedValue("OK");
    expandFileSystemMock.mockResolvedValue("OK");
    enableMouseCursorMock.mockResolvedValue("OK");
    enablePtSysOledMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn()
    };

    mount = (props = defaultProps) => {
      return render(<WaitPageContainer {...props} />);
    };
  });

  afterEach(() => {
    isFileSystemExpandedMock.mockRestore();
    rebootMock.mockRestore();
    expandFileSystemMock.mockRestore();
    enableMouseCursorMock.mockRestore();
  });

  it("renders the correct banner image", async () => {
    const { queryByAltText } = mount();
    await wait();

    expect(queryByAltText("wait-screen")).toMatchSnapshot();

    await wait();
  });

  it("renders prompt correctly", async () => {
    const { container: upgradePage } = mount();
    await wait();

    const prompt = upgradePage.querySelector(".prompt");
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

  it("doesn't render spinner when checking if file system was expanded", async () => {
    const { container: waitPage } = mount();

    expect(querySpinner(waitPage)).not.toBeInTheDocument();

    await wait();
  });

  it("checks if the file system was expanded", async () => {
    const { } = mount();
    await wait();

    expect(isFileSystemExpandedMock).toHaveBeenCalled();

    await wait();
  });

  it("attempts to expand file system if it's not already expanded", async () => {
    const { } = mount();
    await wait();

    expect(expandFileSystemMock).toHaveBeenCalled();

    await wait();
  });

  it("renders the spinner when expanding the file system", async () => {
    const { container: waitPage, getByText } = mount();

    await waitForElement(() => querySpinner(waitPage));
    expect(querySpinner(waitPage)).toBeInTheDocument();

    await wait();
  });

  it("attempts to reboot after expanding file system", async () => {
    const { } = mount();
    await wait();

    expect(rebootMock).toHaveBeenCalled();

    await wait();
  });


  it("attempts to reboot", async () => {
    isFileSystemExpandedMock.mockResolvedValue({ expanded: false });

    const { } = mount();
    await wait();

    expect(rebootMock).toHaveBeenCalled();

    await wait();
  });

  it("when the fs was already expanded, goes automatically to the Splash page", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: true});
    const { } = mount();
    await wait();

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
    expect(rebootMock).not.toHaveBeenCalled();
    expect(expandFileSystemMock).not.toHaveBeenCalled();

    await wait();
  });

  it("when the fs was already expanded, doesn't expand fs again", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: true});
    const { } = mount();
    await wait();

    expect(expandFileSystemMock).not.toHaveBeenCalled();

    await wait();
  });

  it("when the fs was already expanded, doesn't reboot", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: true});
    const { } = mount();
    await wait();

    expect(rebootMock).not.toHaveBeenCalled();

    await wait();
  });

  it("when there's an error while checking if fs was expanded, renders the error message", async () => {
    isFileSystemExpandedMock.mockRejectedValue(
      new Error("oh oh, something happened")
    );

    const { getByText } = mount();
    await wait();

    await waitForElement(() => getByText(ErrorMessage.GenericError));
  });

  it("when there's an error while trying to reboot, renders the error message", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: false});
    rebootMock.mockRejectedValue(
      new Error("oh oh, something happened")
    );
    const { getByText } = mount();
    await wait();

    await waitForElement(() => getByText(ErrorMessage.GenericError));
  });

  it("when there's an error while expanding filesystem, doesn't call enableMouseCursor nor reboot", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: false});
    expandFileSystemMock.mockRejectedValue(
      new Error("oh oh, something happened")
    );

    const { getByText } = mount();
    await wait();

    expect(enableMouseCursorMock).not.toHaveBeenCalled();
    expect(rebootMock).not.toHaveBeenCalled();

  });

  it("when there's an error while enabling mouse cursor, doesn't call reboot", async () => {
    isFileSystemExpandedMock.mockResolvedValue({expanded: false});
    enableMouseCursorMock.mockRejectedValue(
      new Error("oh oh, something happened")
    );

    const { getByText } = mount();
    await wait();

    expect(rebootMock).not.toHaveBeenCalled();

  });
});
