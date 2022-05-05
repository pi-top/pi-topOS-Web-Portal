import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  wait,
  within,
} from "@testing-library/react";
import { rest } from "msw";

import StandaloneWifiPageContainer from "../StandaloneWifiPageContainer";
import { ErrorMessage, ExplanationMessage } from "../WifiPage";

import queryReactSelect from "../../../../test/helpers/queryReactSelect";
import querySpinner from "../../../../test/helpers/querySpinner";
import { KeyCode } from "../../../../test/types/Keys";
import { server } from "../../../msw/server";
import networks from "../../../msw/data/networks.json";
import textContentMatcher from "../../../../test/helpers/textContentMatcher";

let mockUserAgent = "not-web-renderer";
Object.defineProperty(window.navigator, "userAgent", {
  get() {
    return mockUserAgent;
  },
});

const setRunningOnWebRenderer = (onWebRenderer = true) => {
  mockUserAgent = onWebRenderer ? "web-renderer" : "not-web-renderer"
};

// increase timeout so failure messages are not timeout messages
jest.setTimeout(10000);

const fetchingNetworksMessage = "fetching networks...";

const mount = () => render(<StandaloneWifiPageContainer />);

describe("StandaloneWifiPageContainer", () => {
  beforeEach(() => {
    setRunningOnWebRenderer(false)
  })

  it("renders spinner while loading", async () => {
    mount();

    expect(querySpinner(document.body)).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );
  });

  it("renders correct message while loading", async () => {
    mount();

    expect(screen.queryByText(fetchingNetworksMessage)).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );
  });

  it("does not render buttons when using browser", async () => {
    const { getByTestId } = mount();
    const layout = getByTestId('layout')

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(within(layout).queryByText("Back")).not.toBeInTheDocument();
    expect(within(layout).queryByText("Next")).not.toBeInTheDocument();
    expect(within(layout).queryByText('Skip')).not.toBeInTheDocument()
  });

  it("does not render navigation buttons when using web-renderer", async () => {
    setRunningOnWebRenderer(true)

    const { getByTestId } = mount();
    const layout = getByTestId('layout')

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(within(layout).queryByText("Back")).not.toBeInTheDocument();
    expect(within(layout).queryByText("Next")).not.toBeInTheDocument();
    expect(within(layout).queryByText('Skip')).not.toBeInTheDocument()
  });

  it("renders correct explanation when not connected to network", async () => {
    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(
      screen.queryByText(ExplanationMessage.NotConnected)
    ).toBeInTheDocument();
  });

  it("renders correct explanation when connected to network", async () => {
    server.use(
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.json(networks[0].bssid));
      })
    );

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(
      screen.getByText(ExplanationMessage.WiFiConnection)
    ).toBeInTheDocument();
  });

  it('shows correct connected network when already connected to network', async () => {
    server.use(
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.json(networks[0].bssid));
      })
    );

    mount();

    expect(await screen.findAllByText(networks[0].ssid)).toHaveLength(2)
  })

  it("renders error message when unable to get network", async () => {
    server.use(
      rest.get("/wifi-ssids", (_, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(screen.queryByText(ErrorMessage.FetchNetworks)).toBeInTheDocument();
  });

  it("renders error message when unable to get current bssid", async () => {
    server.use(
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    expect(screen.queryByText(ErrorMessage.FetchNetworks)).toBeInTheDocument();
  });

  it("renders networks in select when they are loaded successfully", async () => {
    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    networks.forEach(({ ssid }) => {
      expect(screen.queryByText(ssid)).toBeInTheDocument();
    });
  });

  it("can refresh networks list when loading networks fails", async () => {
    server.use(
      rest.get("/wifi-ssids", (_, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    server.resetHandlers();
    fireEvent.click(screen.getByAltText("refresh-button"));

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    expect(screen.getByText("Depto 606")).toBeInTheDocument();
  });

  it("can refresh networks list when loading current bssid fails", async () => {
    server.use(
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.status(401));
      })
    );

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    server.resetHandlers();
    fireEvent.click(screen.getByAltText("refresh-button"));

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    expect(screen.getByText("Depto 606")).toBeInTheDocument();
  });



  it("shows the connect dialog when network option is clicked", async () => {
    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click a network option
    fireEvent.click(screen.getByText(networks[0].ssid));

    expect(screen.getByTestId("connect-dialog")).not.toHaveClass("hidden");
  });

  it("renders connect dialog message correctly when network requires password", async () => {
    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    expect(
      screen.getByText(
        textContentMatcher(
          `The WiFi network ${network.ssid} requires a password`
        )
      )
    ).toBeInTheDocument();
  });

  it("shows connection successful message after connecting to network", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // enter correct password
    const passwordInputLabel = screen.getByLabelText("Enter password below");
    fireEvent.change(passwordInputLabel, {
      target: { value: "correct-password" },
    });

    // join network
    fireEvent.click(screen.getByText("Join"));

    // connecting message should be shown
    expect(
      screen.getByText(textContentMatcher(`Connecting to ${network.ssid}...`))
    ).toBeInTheDocument();

    // connected message should be shown eventually
    expect(
      await screen.findByText(
        textContentMatcher(
          `Great, your pi-top is connected to ${network.ssid}!`
        )
      )
    ).toBeInTheDocument();
  });

  it("prompts user to reconnect to pi-top network if disconnected while connecting to Wi-Fi", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // enter correct password
    const passwordInputLabel = screen.getByLabelText("Enter password below");
    fireEvent.change(passwordInputLabel, {
      target: { value: "correct-password" },
    });

    // simulate wifi-creds failing and then  request hanging due to connection to pi-top being disrupted
    server.use(
      rest.post<{ bssid: string; password: string }>(
        "/wifi-credentials",
        (_, res, ctx) => {
          return res(ctx.status(500));
        }
      ),
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.delay(5000), ctx.status(400));
      })
    );

    // join network
    fireEvent.click(screen.getByText("Join"));

    // reconnect to pi-top hotspot dialog should be shown
    expect(
      await screen.findByText("Reconnect to pi-top hotspot")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        textContentMatcher(
          /Your computer has disconnected from the pi-top-XXXX Wi-Fi hotspot\. Please reconnect to it to continue onboarding/
        )
      )
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Reconnect to pitop hotspot")
    ).toBeInTheDocument();

    // simulate user reconnecting to pitop hotspot
    server.use(
      rest.get("/current-wifi-bssid", (_, res, ctx) => {
        return res(ctx.json(network.bssid));
      })
    );

    // connected message should be shown eventually
    expect(
      await screen.findByText(
        textContentMatcher(
          `Great, your pi-top is connected to ${network.ssid}!`
        )
      )
    ).toBeInTheDocument();
  });

  it("renders error when incorrect password is used to connect to network", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // enter incorrect password
    const passwordInputLabel = screen.getByLabelText("Enter password below");
    fireEvent.change(passwordInputLabel, {
      target: { value: "incorrect-password" },
    });

    // join network
    fireEvent.click(screen.getByText("Join"));

    expect(
      await screen.findByText(
        `There was an error connecting to ${network.ssid}... please check your password and try again`
      )
    ).toBeInTheDocument();
  });

  it("clears incorrect password error when cancel is clicked and new network selected", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // enter incorrect password
    const passwordInputLabel = screen.getByLabelText("Enter password below");
    fireEvent.change(passwordInputLabel, {
      target: { value: "incorrect-password" },
    });

    // join network
    fireEvent.click(screen.getByText("Join"));

    expect(
      await screen.findByText(
        `There was an error connecting to ${network.ssid}... please check your password and try again`
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    // pick new network
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });
    fireEvent.click(screen.getByText(network.ssid));

    // error should not be rendered
    expect(
      screen.queryByText(
        `There was an error connecting to ${network.ssid}... please check your password and try again`
      )
    ).not.toBeInTheDocument();
  });

  it("clears incorrect password error when retry is clicked", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // enter incorrect password
    const passwordInputLabel = screen.getByLabelText("Enter password below");
    fireEvent.change(passwordInputLabel, {
      target: { value: "incorrect-password" },
    });

    // join network
    fireEvent.click(screen.getByText("Join"));

    expect(
      await screen.findByText(
        `There was an error connecting to ${network.ssid}... please check your password and try again`
      )
    ).toBeInTheDocument();

    // enter correct password and retry
    fireEvent.change(passwordInputLabel, {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByText("Retry"));

    // it hides the error as soon as retry button is clicked
    expect(
      screen.queryByText(
        `There was an error connecting to ${network.ssid}... please check your password and try again`
      )
    ).not.toBeInTheDocument();

    // retried request succeeds
    expect(
      await screen.findByText(/Great, your pi-top is connected/)
    ).toBeInTheDocument();
  });

  it("hides the connect dialog on connect dialog cancel click", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // cancel connecting to network
    fireEvent.click(screen.getByText("Cancel"));

    // connect dialog should not be visible
    expect(screen.getByTestId("connect-dialog")).toHaveClass("hidden");
  });

  it("resets selected network in select on connect dialog cancel click", async () => {
    const network = networks.find(({ passwordRequired }) => passwordRequired)!;

    mount();

    await waitForElementToBeRemoved(() =>
      screen.getByText(fetchingNetworksMessage)
    );

    // open the select
    fireEvent.keyDown(queryReactSelect(document.body)!, {
      keyCode: KeyCode.DownArrow,
    });

    // click the wifi option
    fireEvent.click(screen.getByText(network.ssid));

    // cancel connecting to network
    fireEvent.click(screen.getByText("Cancel"));

    // network should not be the selected option in the networks select
    expect(screen.queryByText(network.ssid)).not.toBeInTheDocument();
  });
});
