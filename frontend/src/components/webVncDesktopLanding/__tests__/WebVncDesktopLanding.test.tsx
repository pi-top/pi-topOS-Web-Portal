import React from "react";
import {
  fireEvent,
  wait,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import WebVncDesktopLanding from "../WebVncDesktopLanding";
import textContentMatcher from "../../../../test/helpers/textContentMatcher";
import { runningOnWebRenderer } from '../../../helpers/utils'
import vncServiceStatus from "../../../services/vncServiceStatus";

jest.mock('../../../helpers/utils')
jest.mock('../../../services/vncServiceStatus')

const runningOnWebRendererMock = runningOnWebRenderer as jest.Mock
const vncServiceStatusMock = vncServiceStatus as jest.Mock

window.open = jest.fn();

const matchers = {
  useDifferentDeviceWarning: textContentMatcher(/Remote desktop cannot be used when on your pi-top. Open pi-top\.local or the IP address on your miniscreen on a separate computer\./),
  initialising: "Getting VNC service status...",
  stopped: textContentMatcher(/The VNC service is not enabled in your device\. Make sure to enable it and try again\.If your device is a pi-top\[4\]\, you can do this by navigating to the Settings menu in you miniscreen\./),
  error: /There was an error while fetching your device state. Please try again later./,
  running : /Access programs and resources on your pi-top as if you were actually working on it!/,
};

const mount = () => render(<WebVncDesktopLanding />);

describe("WebVncDesktopLanding", () => {
  afterEach(() => {
    runningOnWebRendererMock.mockImplementation(() => false)
  })

  it('shows warning message when on web renderer', () => {
    runningOnWebRendererMock.mockImplementation(() => true);
    mount();

    expect(screen.getByText(matchers.useDifferentDeviceWarning)).toBeInTheDocument();
  })

  it("shows loading message while getting initial controller status", async () => {
    mount();

    expect(screen.getByText(matchers.initialising)).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByText(matchers.initialising)
    );
  });

  it("renders banner image", async () => {
    mount();

    expect(screen.getByAltText("remote desktop banner")).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByText(matchers.initialising)
    );
  });

  it("shows correct message when VNC service is running", async () => {
    vncServiceStatusMock.mockResolvedValue({isRunning: true});
    mount();

    expect(await screen.findByText(matchers.running)).toBeInTheDocument();
  });

  it("button is enabled when VNC service is running", async () => {
    vncServiceStatusMock.mockResolvedValue({isRunning: true});
    mount();

    await wait();
    expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", false);
  });

  it("clicking button opens desktop page in a new tab when VNC service is running", async () => {
    vncServiceStatusMock.mockResolvedValue({isRunning: true});
    mount();

    await wait();
    fireEvent.click(screen.getByText("Let\'s Go!").parentElement);
    expect(window.open).toHaveBeenNthCalledWith(
      1,
      "/desktop",
    )
  });

  it("shows correct message when VNC service is stopped", async () => {
    vncServiceStatusMock.mockResolvedValue({isRunning: false});
    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
  });

  it("button is disabled when VNC service is stopped", () => {
    vncServiceStatusMock.mockResolvedValue({isRunning: false});
    mount();

    expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
  });

  it("shows correct message when VNC request fails", async () => {
    vncServiceStatusMock.mockRejectedValue(new Error("oh oh..."));
    mount();

    expect(await screen.findByText(matchers.error)).toBeInTheDocument();
  });

  it("button is disabled when VNC request fails", () => {
    vncServiceStatusMock.mockRejectedValue(new Error("oh oh..."));
    mount();

    expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
  });
});
