import React from "react";
import { rest } from "msw";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import RoverControllerLanding from "../RoverControllerLanding";
import textContentMatcher from "../../../../test/helpers/textContentMatcher";
import { server } from "../../../msw/server";
import { act } from "react-dom/test-utils";
import { runningOnWebRenderer } from '../../../helpers/utils'

jest.mock('../../../helpers/utils')

const runningOnWebRendererMock = runningOnWebRenderer as jest.Mock

const matchers = {
  useDifferentDeviceWarning: textContentMatcher(/Rover controller cannot be used when on your pi-top. Open pi-top\.local or the IP address on your miniscreen on a separate computer\./),
  initialising: "Getting rover controller status...",
  stopped: textContentMatcher(
    /Have adventures with your very own pi-top \[4\] Mars rover\!Control your rover directly from your computer or phone\.If you have not built your rover yet there is an instructional booklet and video\./
  ),
  started: /Rover controller is running/,
  starting: /Launching rover controller/,
  stopping: /Stopping rover controller/,
  crashed: textContentMatcher(
    /Rover controller has crashed!Check your Expansion Plate and Camera are connected to your pi-top \[4\]/
  ),
  startFailed: "Failed to launch rover controller!",
  stopFailed: "Failed to stop rover controller!",
  openLink: "Open Rover Controller",
};

function setControllerStatus(status: string) {
  server.use(
    rest.get("/rover-controller-status", (_, res, ctx) =>
      res(ctx.json({ status }))
    )
  );
}

const mount = () => render(<RoverControllerLanding />);

describe("RoverControllerLanding", () => {
  afterEach(() => {
    runningOnWebRendererMock.mockImplementation(() => false)
  })

  it('shows warning message when on web renderer', () => {
    runningOnWebRendererMock.mockImplementation(() => true)

    mount()

    expect(screen.getByText(matchers.useDifferentDeviceWarning)).toBeInTheDocument()
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

    expect(screen.getByAltText("rover controller banner")).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.getByText(matchers.initialising)
    );
  });

  it("shows correct message when controller is stopped", async () => {
    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
  });

  it("shows correct message with 'Open' link when controller is started", async () => {
    setControllerStatus("active");

    mount();

    expect(await screen.findByText(matchers.started)).toBeInTheDocument();

    const openLink = screen.getByText(matchers.openLink, {
      selector: "a",
    });
    expect(openLink).toHaveAttribute("href", "http://localhost:8070");
    expect(openLink).toHaveAttribute("target", "_blank");
  });

  it("starts controller when Launch button is clicked", async () => {
    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Launch"));

    // it tells the user the controller is starting and shows disabled Stop button
    expect(await screen.findByText(matchers.starting)).toBeInTheDocument();
    expect(screen.getByText("Launch").parentElement).toBeDisabled();

    // simulate service starting successfully
    setControllerStatus("active")

    // it tells the user the controller has started and shows enabled Stop button
    expect(await screen.findByText(matchers.started)).toBeInTheDocument();
    expect(screen.getByText("Stop").parentElement).toBeEnabled();
  });

  it("stops controller when Stop button is clicked", async () => {
    setControllerStatus("active");

    mount();

    expect(await screen.findByText(matchers.started)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Stop"));

    // it tells the user the controller is stopping and shows disabled Stop button
    expect(await screen.findByText(matchers.stopping)).toBeInTheDocument();
    expect(screen.getByText("Stop").parentElement).toBeDisabled();

    // simulate service stopping successfully
    setControllerStatus("inactive");

    // it shows initial message when stopped
    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    expect(screen.getByText("Launch").parentElement).toBeEnabled();
  });

  it("shows troubleshooting message when controller crashes", async () => {
    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Launch"));

    // simulate controller starting successfully
    setControllerStatus("active");

    // simulate service crashing after having started
    await act(
      () =>
        new Promise<void>((res) => {
          setTimeout(() => {
            setControllerStatus("failed");
            res();
          }, 2000);
        })
    );

    // shows message that controller has failed to start with troubleshooting
    expect(await screen.findByText(matchers.crashed)).toBeInTheDocument();
  });

  it("allows the user to retry launching when controller crashes on startup", async () => {
    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Launch"));

    // simulate service crashing on startup
    setControllerStatus("failed");

    // shows message that controller has failed to start with troubleshooting
    expect(await screen.findByText(matchers.crashed)).toBeInTheDocument();

    // retry launching controller
    fireEvent.click(screen.getByText("Relaunch"));

    // simulate a successful relaunch
    setControllerStatus("active");

    expect(await screen.findByText(matchers.started)).toBeInTheDocument();
  });

  it("allows the user to retry launching when start request fails", async () => {
    server.use(
      rest.post("/rover-controller-start", (_, res, ctx) =>
        res(ctx.status(500))
      )
    );

    mount();

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Launch"));

    // shows message that controller has failed to start
    expect(await screen.findByText(matchers.startFailed)).toBeInTheDocument();
    //
    // reset handler so start request responds with 200 next time
    server.resetHandlers();

    // retry launching controller
    fireEvent.click(screen.getByText("Retry"));

    // set status to 'active' to simulate a successful retry
    setControllerStatus("active");

    expect(await screen.findByText(matchers.started)).toBeInTheDocument();
  });

  it("allows the user to retry stopping when stop request fails", async () => {
    server.use(
      rest.post("/rover-controller-stop", (_, res, ctx) => res(ctx.status(500)))
    );

    setControllerStatus("active");

    mount();

    expect(await screen.findByText(matchers.started)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Stop"));

    // shows message that controller has failed to stop
    expect(await screen.findByText(matchers.stopFailed)).toBeInTheDocument();

    // still has open link in case user want's to open controller
    expect(
      screen.getByText(matchers.openLink, { selector: "a" })
    ).toBeInTheDocument();

    // reset handler so stop request responds with 200 next time
    server.resetHandlers();

    // retry launching controller
    fireEvent.click(screen.getByText("Retry"));

    // set status to 'inactive' to simulate a successful retry
    setControllerStatus("inactive");

    expect(await screen.findByText(matchers.stopped)).toBeInTheDocument();
  });
});
