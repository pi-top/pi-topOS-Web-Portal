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
import getVncWpaGuiUrl from "../../../../services/getVncWpaGuiUrl";
import startVncWpaGui from "../../../../services/startVncWpaGui";
import stopVncWpaGui from "../../../../services/stopVncWpaGui";

jest.mock("../../../../services/startVncWpaGui");
jest.mock("../../../../services/getVncWpaGuiUrl");
jest.mock("../../../../services/stopVncWpaGui");

const startVncWpaGuiMock = startVncWpaGui as jest.Mock;
const getVncWpaGuiUrlMock = getVncWpaGuiUrl as jest.Mock;
const stopVncWpaGuiMock = stopVncWpaGui as jest.Mock;
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
      startVncWpaGuiMock.mockResolvedValue(true);
      getVncWpaGuiUrlMock.mockResolvedValue("");

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
      getVncWpaGuiUrlMock.mockRestore();
      startVncWpaGuiMock.mockRestore();
      ReactDom.createPortal = originalCreatePortal;
    });

    it("calls startVncWpaGuiMock", () => {
      expect(startVncWpaGuiMock).toHaveBeenCalled();
    });

    it("polls getVncWpaGuiUrlMock and renders spinner", async () => {
      // skip to first poll
      jest.advanceTimersByTime(startPollDelay + pollTime);

      expect(getVncWpaGuiUrlMock).toHaveBeenCalled();

      expect(querySpinner(advancedConfigDialogContainer)).toBeInTheDocument();

      // skip to next poll
      jest.advanceTimersByTime(pollTime);

      expect(getVncWpaGuiUrlMock).toHaveBeenCalled();
    });

    it("shows an iframe when getVncWpaGuiUrlMock returns a url", async () => {
      getVncWpaGuiUrlMock.mockResolvedValue({ url: "http://example.com" });

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

    it("when you click close, calls stopVncWpaGuiMock and onClose", async () => {
      fireEvent.click(getByText("Close"));
      expect(stopVncWpaGuiMock).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
