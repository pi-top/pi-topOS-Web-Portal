import React from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  RenderResult,
  wait,
  fireEvent,
  getByLabelText,
  waitForElement,
  GetByBoundAttribute,
  QueryByBoundAttribute,
} from "@testing-library/react";

import RestartPageContainer, { Props } from "../RestartPageContainer";
import { ErrorMessage, ExplanationMessages } from "../RestartPage";
import querySpinner from "../../../../test/helpers/querySpinner";

import configureLanding from "../../../services/configureLanding";
import deprioritiseOpenboxSession from "../../../services/deprioritiseOpenboxSession";
import enableFurtherLinkService from "../../../services/enableFurtherLinkService";
import enableFirmwareUpdaterService from "../../../services/enableFirmwareUpdaterService";
import restoreFiles from "../../../services/restoreFiles";
import stopOnboardingAutostart from "../../../services/stopOnboardingAutostart";
import reboot from "../../../services/reboot";
import serverStatus from "../../../services/serverStatus";
import updateEeprom from "../../../services/updateEeprom";
import enablePtMiniscreen from "../../../services/enablePtMiniscreen";
import verifyDeviceNetwork from "../../../services/verifyDeviceNetwork";
import disableApMode from "../../../services/disableApMode";


import { act } from "react-dom/test-utils";

jest.mock("../../../services/configureLanding");
jest.mock("../../../services/deprioritiseOpenboxSession");
jest.mock("../../../services/enableFurtherLinkService");
jest.mock("../../../services/enableFirmwareUpdaterService");
jest.mock("../../../services/restoreFiles");
jest.mock("../../../services/stopOnboardingAutostart");
jest.mock("../../../services/reboot");
jest.mock("../../../services/serverStatus");
jest.mock("../../../services/updateEeprom");
jest.mock("../../../services/enablePtMiniscreen");
jest.mock("../../../services/verifyDeviceNetwork");
jest.mock("../../../services/disableApMode");


const configureLandingMock = configureLanding as jest.Mock;
const deprioritiseOpenboxSessionMock = deprioritiseOpenboxSession as jest.Mock;
const enableFurtherLinkServiceMock = enableFurtherLinkService as jest.Mock;
const enableFirmwareUpdaterServiceMock = enableFirmwareUpdaterService as jest.Mock;
const restoreFilesMock = restoreFiles as jest.Mock;
const stopOnboardingAutostartMock = stopOnboardingAutostart as jest.Mock;
const rebootMock = reboot as jest.Mock;
const serverStatusMock = serverStatus as jest.Mock;
const updateEepromMock = updateEeprom as jest.Mock;
const enablePtMiniscreenMock = enablePtMiniscreen as jest.Mock;
const verifyDeviceNetworkMock = verifyDeviceNetwork as jest.Mock;
const disableApModeMock = disableApMode as jest.Mock;


const mockServices = [
  enableFirmwareUpdaterServiceMock,
  enableFurtherLinkServiceMock,
  deprioritiseOpenboxSessionMock,
  restoreFilesMock,
  configureLandingMock,
  stopOnboardingAutostartMock,
  updateEepromMock,
  enablePtMiniscreenMock,
  disableApModeMock,
  rebootMock,
];


const resolveMocks = (mocks: jest.Mock[] = mockServices) => {
  mocks.forEach((mock) => {
    mock.mockResolvedValue("OK");
  });
};

const rejectMocks = (mocks: jest.Mock[] = mockServices) => {
  mocks.forEach((mock, i) => {
    mock.mockRejectedValue(new Error(`Test error message ${i}`));
  });
};

let mockUserAgent = "web-renderer";
Object.defineProperty(global.navigator, "userAgent", {
  get() {
    return mockUserAgent;
  },
});


jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

const userMustConfirmBeforeLeaving = () => {
  // dispatch beforeunload event to simulate beginning of unload process
  const event = new Event('beforeunload')
  const preventDefaultSpy = jest.spyOn(event, "preventDefault");
  window.dispatchEvent(event);

  // calling preventDefault causes most browsers to confirm leaving with user
  // event.returnValue needs to be set for chrome
  return (
    preventDefaultSpy.mock.calls.length > 0 &&
    event.returnValue
  );
};

describe("RestartPageContainer", () => {
  let defaultProps: Props;
  let restartPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  beforeEach(async () => {
    resolveMocks();
    serverStatusMock.mockResolvedValue("OK");
    verifyDeviceNetworkMock.mockResolvedValue({
      shouldSwitchNetwork: false,
      shouldDisplayDialog: false,
      piTopIp: "192.168.64.1",
      clientIp: "192.168.64.10",
    });
    mockUserAgent = "web-renderer";
    defaultProps = {};

    ({
      container: restartPageContainer,
      queryByText,
      getByText,
      rerender,
      queryByTestId,
      getByTestId,
    } = render(<RestartPageContainer {...defaultProps} />));
  });
  afterEach(() => {
    mockServices.forEach((mock) => {
      mock.mockRestore();
    });
  });

  it("does not render back button", () => {
    expect(queryByText("Back")).not.toBeInTheDocument();
  });

  it("does not render error message", () => {
    expect(
      restartPageContainer.querySelector(".error")
    ).not.toBeInTheDocument();
  });

  it("does not ask user for confirmation before they leave the page", async () => {
    expect(userMustConfirmBeforeLeaving()).toBeFalsy();
  });

  it("renders prompt correctly", async () => {
    expect(restartPageContainer.querySelector(".prompt")).toMatchSnapshot();
  });

  it("calls verifyDeviceNetwork service", async () => {
    expect(verifyDeviceNetworkMock).toHaveBeenCalled()
  });

  it("doesn't render connectivity dialog", async () => {
    expect(queryByTestId("connectivity-dialog")).not.toBeInTheDocument();
  });

  describe("when goToPreviousPage is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        goToPreviousPage: jest.fn(),
      };

      rerender(<RestartPageContainer {...defaultProps} />);
    });

    it("renders back button", () => {
      expect(queryByText("Back")).toBeInTheDocument();
    });

    it("calls goToPreviousPage on back button click", () => {
      fireEvent.click(getByText("Back"));

      expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
    });

    it("disables back button on restart click", async () => {
      const restartButton = getByText("Restart").parentElement
      if(restartButton) fireEvent.click(restartButton);

      expect(queryByText("Back")).toBeDisabled();

      await wait();
    });
  });

  describe("on restart click", () => {
    it("renders progress", async () => {
      const restartButton = getByText("Restart").parentElement
      if(restartButton) fireEvent.click(restartButton);

      expect(
        restartPageContainer.querySelector(".progress")
      ).toBeInTheDocument();

      await wait();
    });

    it("disables restart button", async () => {
      const restartButton = getByText("Restart").parentElement
      if(restartButton) fireEvent.click(restartButton);

      expect(queryByText("Restart")?.parentElement).toBeDisabled();

      await wait();
    });

    it("asks user for confirmation before they leave the page", async () => {
      const restartButton = getByText("Restart").parentElement
      if(restartButton) fireEvent.click(restartButton);
      await wait();

      expect(userMustConfirmBeforeLeaving()).toBeTruthy();

      await wait();
    });

    it("calls correct services", async () => {
      const restartButton = getByText("Restart").parentElement
      if(restartButton) fireEvent.click(restartButton);

      await wait();

      mockServices.forEach((mock) => {
        expect(mock).toHaveBeenCalled();
      });
    });

    describe('when configure landing fails', () => {
      beforeEach(() => {
        configureLandingMock.mockRejectedValue(new Error());
      });

      it('calls remaining services', async () => {
        fireEvent.click(getByText("Restart"));

        await wait();

        mockServices.forEach((mock) => {
          expect(mock).toHaveBeenCalled();
        });
      });
    });

    describe('when deprioritise openbox session fails', () => {
      beforeEach(() => {
        deprioritiseOpenboxSessionMock.mockRejectedValue(new Error());
      });

      it('calls remaining services', async () => {
        fireEvent.click(getByText("Restart"));

        await wait();

        mockServices.forEach((mock) => {
          expect(mock).toHaveBeenCalled();
        });
      });
    });

    describe('when stop onboarding autostart fails', () => {
      beforeEach(() => {
        stopOnboardingAutostartMock.mockRejectedValue(new Error());
      });

      it('calls remaining services', async () => {
        fireEvent.click(getByText("Restart"));

        await wait();

        mockServices.forEach((mock) => {
          expect(mock).toHaveBeenCalled();
        });
      });
    });

    describe('when update EEPROM fails', () => {
      beforeEach(() => {
        updateEepromMock.mockRejectedValue(new Error());
      });

      it('calls remaining services', async () => {
        fireEvent.click(getByText("Restart"));

        await wait();

        mockServices.forEach((mock) => {
          expect(mock).toHaveBeenCalled();
        });
      });
    });

    describe('when disabling access point fails', () => {
      beforeEach(() => {
        disableApModeMock.mockRejectedValue(new Error());
      });

      it('calls remaining services', async () => {
        fireEvent.click(getByText("Restart"));

        await wait();

        mockServices.forEach((mock) => {
          expect(mock).toHaveBeenCalled();
        });
      });
    });

    describe('when reboot fails', () => {
      beforeEach(async () => {
        rebootMock.mockRejectedValue(new Error());

        fireEvent.click(getByText("Restart"));

        await wait();
      });

      it('disables restart button', async () => {
        expect(queryByText('Restart')?.parentElement).toBeDisabled();
      });

      it('renders reboot error message', () => {
        expect(queryByText(ErrorMessage.RebootError)).toBeInTheDocument();
      });

      it('stops rendering progress', () => {
        expect(restartPageContainer.querySelector('.progress')).not.toBeInTheDocument();
      })
    });

    describe('after reboot call when running through an external browser', () => {
      beforeEach(async () => {
        jest.useFakeTimers();
        mockUserAgent = "not-web-renderer";
        serverStatusMock.mockResolvedValue("OK");
        fireEvent.click(getByText("Restart"));
        await wait();
      });
      afterEach(() => jest.useRealTimers());

      it('displays a wait message', async () => {
        ExplanationMessages.OnBrowser.split('\n').map(function(item, _) {
          item && expect(getByText(item)).toBeInTheDocument();
        });

        await act(async () => {
          jest.runOnlyPendingTimers();
          await Promise.resolve();
        });
      });

      it('starts querying device to learn if its back online', async () => {
        await act(async () => {
          jest.runOnlyPendingTimers();
          await Promise.resolve();
        });
        expect(serverStatusMock).toHaveBeenCalled();
      });

      it('renders a spinner', async () => {
        await act(async () => {
          jest.runOnlyPendingTimers();
          await Promise.resolve();
        });
        expect(querySpinner(restartPageContainer)).toBeInTheDocument();
      });

      it("asks user for confirmation before they leave the page", async () => {

        const restartButton = getByText("Restart").parentElement
        if(restartButton) fireEvent.click(restartButton);

        await wait();

        expect(userMustConfirmBeforeLeaving()).toBeTruthy();

        await wait();
      });

      describe('when the device is back online', () => {
        it('updates the displayed message', async () => {
          await act(async () => {
            jest.runOnlyPendingTimers();
            jest.runOnlyPendingTimers();
            await Promise.resolve();
          });
          expect(getByText("The device is back online!")).toBeInTheDocument()
        });

        it('doesn\'t render a spinner', async () => {
          await act(async () => {
            jest.runOnlyPendingTimers();
            jest.runOnlyPendingTimers();
            await Promise.resolve();
          });
          expect(querySpinner(restartPageContainer)).not.toBeInTheDocument();
        });

        it("does not ask user for confirmation before they leave the page", async () => {
          await act(async () => {
            jest.runOnlyPendingTimers();
            jest.runOnlyPendingTimers();
            await Promise.resolve();
          });
          expect(userMustConfirmBeforeLeaving()).toBeFalsy();
        });
      });
    });
  });

  describe("when globalError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        globalError: true,
      };

      rerender(<RestartPageContainer {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(getByText(ErrorMessage.GlobalError)).toBeInTheDocument();
    });
  });
});
