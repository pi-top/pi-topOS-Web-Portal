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
import getVncDesktopUrl from "../../../services/getVncDesktopUrl";
import { act } from "react-dom/test-utils";
import querySpinner from "../../../../test/helpers/querySpinner";

jest.mock('../../../helpers/utils');
jest.mock('../../../services/vncServiceStatus');
jest.mock('../../../services/getVncDesktopUrl');

const runningOnWebRendererMock = runningOnWebRenderer as jest.Mock;
const vncServiceStatusMock = vncServiceStatus as jest.Mock;
const getVncDesktopUrlMock = getVncDesktopUrl as jest.Mock;

window.open = jest.fn();
// Mock window.location.href for standalone mode testing
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

const matchers = {
  useDifferentDeviceWarning: textContentMatcher(/Remote desktop cannot be used when on your pi-top. Open pi-top\.local or the IP address on your miniscreen on a separate computer\./),
  initialising: "Getting VNC service status...",
  stopped: textContentMatcher(/The VNC service is not enabled in your device\. Make sure to enable it and try again\.If your device is a pi-top\[4\]\, you can do this by navigating to the Settings menu in you miniscreen\./),
  error: /There was an error while fetching your device state. Please try again later./,
  running : /Access programs and resources on your pi-top as if you were actually working on it!/,
  redirecting: "Redirecting to desktop...",
};

const mount = (props = {}) => render(<WebVncDesktopLanding {...props} />);

describe("WebVncDesktopLanding", () => {
  afterEach(() => {
    runningOnWebRendererMock.mockImplementation(() => false)
    vncServiceStatusMock.mockRestore();
    getVncDesktopUrlMock.mockRestore();
    // Reset window.location.href
    window.location.href = '';
  })

  it('shows warning message when on web renderer', () => {
    runningOnWebRendererMock.mockImplementation(() => true);
    mount();

    expect(screen.getByText(matchers.useDifferentDeviceWarning)).toBeInTheDocument();
  })

  it("shows loading message while getting VNC service status", async () => {
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

  describe("when VNC service is running and an URL is received", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockResolvedValue({url: "http://pi-top.com"})
      mount();
      await wait();
    })

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.running)).toBeInTheDocument();
    });

    it("button is enabled", async () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", false);
    });

    it("clicking button opens desktop page in a new tab", async () => {
      act(() => {
        fireEvent.click(screen.getByText("Let\'s Go!").parentElement);
      });

      expect(window.open).toHaveBeenNthCalledWith(1, "http://pi-top.com");
    });
  });

  describe("when VNC service is running and an URL is received in standalone mode", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockResolvedValue({url: "http://pi-top.com"})
      mount({ standalone: true });
      await wait();
    })

    it("shows redirecting message", async () => {
      expect(await screen.findByText(matchers.redirecting)).toBeInTheDocument();
    });

    it("button is disabled", async () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });

    it("redirects to desktop URL", async () => {
      expect(window.location.href).toBe("http://pi-top.com");
    });
  });

  describe("when VNC service is stopped", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: false});
      mount();
      await wait();
    })

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });

    it("doesn't try to get the URL", () => {
      expect(getVncDesktopUrlMock).not.toHaveBeenCalled();
    });
  })

  describe("when VNC service is stopped in standalone mode", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: false});
      mount({ standalone: true });
      await wait();
    })

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });

    it("doesn't try to get the URL", () => {
      expect(getVncDesktopUrlMock).not.toHaveBeenCalled();
    });
  })

  describe("when VNC service is running but an empty URL is received", () => {
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockResolvedValue({url: ""});
      mount();
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    });

    it("button is disabled when URL is empty", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });

  describe("when VNC service is running but an empty URL is received in standalone mode", () => {
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockResolvedValue({url: ""});
      mount({ standalone: true });
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    });

    it("button is disabled when URL is empty", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });

  describe("when VNC-status request fails", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockRejectedValue(new Error("oh oh..."));
      mount();
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.error)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });

  describe("when VNC-status request fails in standalone mode", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockRejectedValue(new Error("oh oh..."));
      mount({ standalone: true });
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.error)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });

  describe("when URL request fails", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockRejectedValue(new Error("oh oh..."));
      mount();
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.error)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });

  describe("when URL request fails in standalone mode", () =>{
    beforeEach(async () => {
      vncServiceStatusMock.mockResolvedValue({isRunning: true});
      getVncDesktopUrlMock.mockRejectedValue(new Error("oh oh..."));
      mount({ standalone: true });
      await wait();
    });

    it("shows correct message", async () => {
      expect(await screen.findByText(matchers.error)).toBeInTheDocument();
    });

    it("button is disabled", () => {
      expect(screen.getByText("Let\'s Go\!").parentElement).toHaveProperty("disabled", true);
    });
  });
});
