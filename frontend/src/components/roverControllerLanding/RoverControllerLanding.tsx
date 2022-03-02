import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import Layout from "../layout/Layout";

import styles from "./RoverControllerLanding.module.css";
import upgradePage from "../../assets/images/upgrade-page.png";
import Spinner from "../atoms/spinner/Spinner";
import startRoverController from "../../services/startRoverController";
import stopRoverController from "../../services/stopRoverController";
import getRoverControllerStatus from "../../services/getRoverControllerStatus";
import usePrevious from "../../hooks/usePrevious";
import Link from "../atoms/link/Link";
import { runningOnWebRenderer } from "../../helpers/utils";

const pollControllerStatus = ({
  onStatus,
  timeout,
  onTimeout = () => {},
  interval = 1000,
}: {
  onStatus: (status: string) => void;
  timeout?: number;
  onTimeout?: () => void;
  interval?: number;
}) => {
  const intervalId = setInterval(async () => {
    const { status } = await getRoverControllerStatus({
      timeout: interval - 250,
    });

    onStatus(status);
  }, interval);

  const timeoutId =
    !!timeout &&
    setTimeout(() => {
      clearInterval(intervalId);
      onTimeout();
    }, timeout);

  // return clear method
  return () => {
    clearInterval(intervalId);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

const RoverControllerLink = () => (
  <Link
    href={`http://${window.location.hostname}:8070`}
    target="_blank"
    rel="noopener noreferrer"
  >
    Open Rover Controller
  </Link>
);

enum ControllerState {
  Stopped = "STOPPED",
  Started = "STARTED",
  Stopping = "STOPPING",
  Starting = "STARTING",
  StopFailed = "STOP_FAILED",
  StartFailed = "START_FAILED",
  Crashed = "CRASHED",
}

const RoverControllerLanding = () => {
  const [controllerState, setControllerState] = useState<ControllerState>();
  const previousControllerState = usePrevious(controllerState);

  const initialiseControllerState = useCallback(async () => {
    const { status } = await getRoverControllerStatus();
    return setControllerState(
      status === "active" ? ControllerState.Started : ControllerState.Stopped
    );
  }, []);

  const start = useCallback(
    () =>
      startRoverController()
        .then(() => setControllerState(ControllerState.Starting))
        .catch(() => setControllerState(ControllerState.StartFailed)),
    []
  );

  const stop = useCallback(
    () =>
      stopRoverController()
        .then(() => setControllerState(ControllerState.Stopping))
        .catch(() => setControllerState(ControllerState.StopFailed)),
    []
  );

  const { content, buttonLabel, buttonDisabled, onButtonClick } =
    useMemo(() => {
      switch (controllerState) {
        case ControllerState.Stopped:
          return {
            buttonLabel: "Launch",
            onButtonClick: start,
            content: (
              <>
                <p>Have adventures with your very own pi-top [4] Mars rover!</p>
                <p>Control your rover directly from your computer or phone.</p>
                <p>
                  If you have not built your rover yet there is an instructional{" "}
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://static.pi-top.com/documents/pi-top_RoboticsKit_AlexBuild_22012021.pdf"
                  >
                    booklet
                  </Link>{" "}
                  and{" "}
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.youtube.com/watch?v=8c-T1KmL0lY"
                  >
                    video
                  </Link>
                  .
                </p>
              </>
            ),
          };

        case ControllerState.Started:
          return {
            buttonLabel: "Stop",
            onButtonClick: stop,
            content: (
              <>
                <p>Rover controller is running!</p>
                <p>
                  <RoverControllerLink />
                </p>
              </>
            ),
          };

        case ControllerState.Stopping:
          return {
            buttonLabel: "Stop",
            buttonDisabled: true,
            content: (
              <>
                <p>Stopping rover controller...</p>
                <Spinner size={45} />
              </>
            ),
          };

        case ControllerState.Starting:
          return {
            buttonLabel: "Launch",
            buttonDisabled: true,
            content: (
              <>
                <p>Launching rover controller...</p>
                <Spinner size={45} />
              </>
            ),
          };

        case ControllerState.StartFailed:
          return {
            buttonLabel: "Retry",
            onButtonClick: start,
            content: <p>Failed to launch rover controller!</p>,
          };

        case ControllerState.StopFailed:
          return {
            buttonLabel: "Retry",
            onButtonClick: stop,
            content: (
              <>
                <p>Failed to stop rover controller!</p>
                <p>
                  <RoverControllerLink />
                </p>
              </>
            ),
          };

        case ControllerState.Crashed:
          return {
            buttonLabel: "Relaunch",
            onButtonClick: start,
            content: (
              <>
                <p>Rover controller has crashed!</p>
                <p>
                  Check your <span className="green">Expansion Plate</span> and{" "}
                  <span className="green">Camera</span> are connected to your{" "}
                  <span className="green">pi-top [4]</span>
                </p>
              </>
            ),
          };

        default:
          // initialising controller state
          return {
            content: (
              <>
                <p>Getting rover controller status...</p>
                <Spinner size={45} />
              </>
            ),
            buttonLabel: "Launch",
            buttonDisabled: true,
          };
      }
    }, [controllerState, start, stop]);

  // initialise controller state on mount
  useEffect(() => {
    // don't bother initialising if on web renderer
    if (runningOnWebRenderer()) return;

    initialiseControllerState();
  }, [initialiseControllerState]);

  // wait for active status when starting
  useEffect(() => {
    if (
      controllerState !== previousControllerState &&
      controllerState === ControllerState.Starting
    ) {
      return pollControllerStatus({
        onStatus: (status) => {
          if (status === "active") {
            setControllerState(ControllerState.Started);
          }
          if (status === "failed") {
            setControllerState(ControllerState.Crashed);
          }
        },
        onTimeout: () => setControllerState(ControllerState.StartFailed),
        timeout: 30000,
      });
    }
  }, [controllerState, previousControllerState]);

  // wait for inactive status when stopping
  useEffect(() => {
    if (
      controllerState !== previousControllerState &&
      controllerState === ControllerState.Stopping
    ) {
      return pollControllerStatus({
        onStatus: (status) => {
          if (status === "inactive" || status === "failed") {
            setControllerState(ControllerState.Stopped);
          }
        },
        onTimeout: () => setControllerState(ControllerState.StopFailed),
        timeout: 30000,
      });
    }
  }, [controllerState, previousControllerState]);

  // wait for failure status when running
  useEffect(() => {
    if (
      controllerState !== previousControllerState &&
      controllerState === ControllerState.Started
    ) {
      return pollControllerStatus({
        onStatus: (status) => {
          if (status === "failed") {
            setControllerState(ControllerState.Crashed);
          }
        },
      });
    }
  }, [controllerState, previousControllerState]);

  return (
    <Layout
      banner={{
        src: upgradePage,
        alt: "rover controller banner",
      }}
      prompt={
        <>
          Rover <span className="green">Controller</span>
        </>
      }
      nextButton={{
        label: buttonLabel,
        disabled: buttonDisabled,
        onClick: onButtonClick,
      }}
      className={styles.root}
      showHeader={false}
    >
      {
        <div className={styles.content}>
          {runningOnWebRenderer() ? (
            <p>
              Rover controller cannot be used when on your pi-top. Open{" "}
              <span className="green">pi-top.local</span> or the IP address on
              your miniscreen on a separate computer.
            </p>
          ) : (
            content
          )}
        </div>
      }
    </Layout>
  );
};

export default memo(RoverControllerLanding);
