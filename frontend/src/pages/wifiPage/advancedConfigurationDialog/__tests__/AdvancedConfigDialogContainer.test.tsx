import React, { ReactNode } from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  QueryByBoundAttribute,
  GetByText,
  fireEvent,
  wait,
} from "@testing-library/react";
import ReactDom from "react-dom";
import { act } from "react-dom/test-utils";

import AdvancedConfigDialogContainer, { Props, startPollDelay, pollTime, stopPollTime  } from "../AdvancedConfigDialogContainer";
import { ErrorMessage } from "../AdvancedConfigDialog";

import querySpinner from "../../../../../test/helpers/querySpinner";
import getVncAdvancedWifiGuiUrl from "../../../../services/getVncAdvancedWifiGuiUrl";
import startVncAdvancedWifiGui from "../../../../services/startVncAdvancedWifiGui";
import stopVncAdvancedWifiGui from "../../../../services/stopVncAdvancedWifiGui";

jest.mock("../../../../services/startVncAdvancedWifiGui");
jest.mock("../../../../services/getVncAdvancedWifiGuiUrl");
jest.mock("../../../../services/stopVncAdvancedWifiGui");

const startVncAdvancedWifiGuiMock = startVncAdvancedWifiGui as jest.Mock;
const getVncAdvancedWifiGuiUrlMock = getVncAdvancedWifiGuiUrl as jest.Mock;
const stopVncAdvancedWifiGuiMock = stopVncAdvancedWifiGui as jest.Mock;
const originalCreatePortal = ReactDom.createPortal;

describe("AdvancedConfigDialogContainer", () => {
  let defaultProps: Props;
  let advancedConfigDialogContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let getByText: BoundFunction<GetByText>;

  describe("when active", ()  => {
    beforeEach(async () => {
      jest.useFakeTimers();
      startVncAdvancedWifiGuiMock.mockResolvedValue(true);
      getVncAdvancedWifiGuiUrlMock.mockResolvedValue("");

      ReactDom.createPortal = jest.fn();
      const createPortalMock = ReactDom.createPortal as jest.Mock;
      createPortalMock.mockImplementation((element: ReactNode) => element);

      defaultProps = {
        active: true,
        onClose: jest.fn(),
      };

      ({
        container: advancedConfigDialogContainer,
        queryByText,
        queryByTestId,
        getByText,
      } = render(<AdvancedConfigDialogContainer {...defaultProps} />));
    });

    afterEach(() => {
      jest.useRealTimers();
      getVncAdvancedWifiGuiUrlMock.mockRestore();
      startVncAdvancedWifiGuiMock.mockRestore();
      ReactDom.createPortal = originalCreatePortal;
    });

    it("calls startVncAdvancedWifiGuiMock", () => {
      expect(startVncAdvancedWifiGuiMock).toHaveBeenCalled();
    });

    it("polls getVncAdvancedWifiGuiUrlMock and renders spinner", async () => {
      // skip to first poll
      jest.advanceTimersByTime(startPollDelay + pollTime);

      expect(getVncAdvancedWifiGuiUrlMock).toHaveBeenCalled();

      expect(querySpinner(advancedConfigDialogContainer)).toBeInTheDocument();

      // skip to next poll
      jest.advanceTimersByTime(pollTime);

      expect(getVncAdvancedWifiGuiUrlMock).toHaveBeenCalled();
    });

    it("shows an iframe when getVncAdvancedWifiGuiUrlMock returns a url", async () => {
      getVncAdvancedWifiGuiUrlMock.mockResolvedValue({ url: "http://example.com" });

      // skip to first poll
      jest.advanceTimersByTime(startPollDelay + pollTime);
      await wait();

      expect(queryByTestId("advanced-config-dialog-frame")).toBeInTheDocument();
    });

    it("shows an error when polling timesout", async () => {
      await act(async () => {
        // skip to poll timeout
        jest.advanceTimersByTime(startPollDelay + stopPollTime);
        await wait();
      });

      expect(queryByText(ErrorMessage.AdvancedConfigError)).toBeInTheDocument();
    });

    it("when you click close, calls stopVncAdvancedWifiGuiMock and onClose", async () => {
      fireEvent.click(getByText("Close"));
      expect(stopVncAdvancedWifiGuiMock).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
