import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  RenderResult,
  QueryByBoundAttribute,
  wait,
} from "@testing-library/react";

import RestartPage, { Props, ErrorMessage, ExplanationMessages } from "../RestartPage";

describe("RestartPage", () => {
  let defaultProps: Props;
  let restartPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  beforeEach(() => {
    defaultProps = {
      onBackClick: jest.fn(),
      setupDevice: jest.fn(),
      isSettingUpDevice: false,
      progressPercentage: 0.5,
      progressMessage: "I am setting up",
      rebootError: false,
      globalError: false,
      isWaitingForServer: false,
      serverRebooted: false,
      displayManualPowerOnDialog: false,
      piTopIpAddress: "pi-top.local",
      shouldDisplayConnectivityDialog: false,
      onManualPowerOnDialogClose: jest.fn(),
      shouldMoveAwayFromAp: false,
      checkingOnSameNetwork: false,
      onConnectivityDialogSkip: jest.fn(),
    };

    ({
      container: restartPage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<RestartPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("reboot-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = restartPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    ExplanationMessages.OnBrowser.split('\n').map(function(item, _) {
      item && expect(getByText(item)).toBeInTheDocument();
    });
  });

  it("doesn't render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("doesn't render connectivity dialog", () => {
    expect(queryByTestId("connectivity-dialog")).not.toBeInTheDocument();
  });

  it("renders restart button", () => {
    expect(queryByText("Restart")).toBeInTheDocument();
  });

  it("renders back button", () => {
    expect(queryByText("Back")).toBeInTheDocument();
  });

  it("doesn't render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("Back button isn't disabled", () => {
    expect(getByText("Back")).toHaveProperty("disabled", false);
  });

  it("Restart button isn't disabled", () => {
    expect(getByText("Restart")).toHaveProperty("disabled", false);
  });

  it("calls onBackClick on back button click", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it('calls setupDevice on restart button click', () => {
    fireEvent.click(getByText('Restart'));

    expect(defaultProps.setupDevice).toHaveBeenCalled();
  })

  describe("when isSettingUpDevice is true and progress info is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isSettingUpDevice: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders progress message", () => {
      expect(queryByText(defaultProps.progressMessage)).toBeInTheDocument();
    });

    it("renders progress bar correctly", () => {
      expect(restartPage.querySelector('.progress')).toMatchSnapshot();
    });

    it("disables the restart button", () => {
      expect(getByText("Restart").parentElement).toBeDisabled();
    });
  });

  describe("when rebootError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        rebootError: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.RebootError)).toBeInTheDocument();
    });

    it("disables restart button", () => {
      expect(queryByText("Restart")?.parentElement).toBeDisabled();
    });
  });

  describe("when globalError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        globalError: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.GlobalError)).toBeInTheDocument();
    });

    it("doesn't render skip button", () => {
      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("doesn't render back button", () => {
      expect(queryByText("Back")).not.toBeInTheDocument();
    })

    it("renders restart button", () => {
      expect(queryByText("Restart")).toBeInTheDocument();
    });

    it('calls setupDevice on restart button click', () => {
      fireEvent.click(getByText('Restart'));

      expect(defaultProps.setupDevice).toHaveBeenCalled();
    })
  });

  describe("when checkingOnSameNetwork is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        checkingOnSameNetwork: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders prompt correctly", () => {
      const prompt = restartPage.querySelector(".prompt");
      expect(prompt).toMatchSnapshot();
    });

    it("renders explanation", () => {
      expect(getByText(ExplanationMessages.CheckingConnectivity)).toBeInTheDocument();
    });

    it("restart button is disabled", () => {
      expect(queryByText("Restart")).toBeDisabled();
    });

    it("back button is hidden", () => {
      expect(queryByText("Back")).toHaveProperty("hidden");
    });
  });

  describe("when devices aren't on the same network", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        checkingOnSameNetwork: false,
        shouldMoveAwayFromAp: true,
        shouldDisplayConnectivityDialog: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders the dialog", () => {
      expect(queryByTestId("connectivity-dialog")).toBeInTheDocument();
    });

    it("displays the dialog", () => {
      expect(queryByTestId("connectivity-dialog")).not.toHaveClass("hidden");
    });

    it("disables restart button", () => {
      expect(queryByText("Restart")).toBeDisabled();
    });

    it("disables back button", () => {
      expect(queryByText("Back")).toBeDisabled();
    });
  });

  describe("when the only connection method is AP", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        checkingOnSameNetwork: false,
        shouldMoveAwayFromAp: false,
        shouldDisplayConnectivityDialog: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders the dialog", () => {
      expect(queryByTestId("connectivity-dialog")).toBeInTheDocument();
    });

    it("displays the dialog", () => {
      expect(queryByTestId("connectivity-dialog")).not.toHaveClass("hidden");
    });

    it("disables restart button", () => {
      expect(queryByText("Restart")).toBeDisabled();
    });

    it("disables back button", () => {
      expect(queryByText("Back")).toBeDisabled();
    });
  });

});
