import React, { useState } from "react";
import { useHistory } from 'react-router-dom';

import RestartPage from "./RestartPage";

import configureTour from "../../services/configureTour";
import deprioritiseOpenboxSession from "../../services/deprioritiseOpenboxSession";
import disableStartupNoise from "../../services/disableStartupNoise";
import enableOSUpdaterService from "../../services/enableOSUpdaterService";
import enableFirmwareUpdaterService from "../../services/enableFirmwareUpdaterService";
import enableFurtherLinkService from "../../services/enableFurtherLinkService";
import unhideAllBootMessages from "../../services/unhideAllBootMessages";
import markEulaAgreed from "../../services/markEulaAgreed";
import stopOnboardingAutostart from "../../services/stopOnboardingAutostart";
import updateMimeDatabase from "../../services/updateMimeDatabase";
import reboot from "../../services/reboot";
import restoreFiles from "../../services/restoreFiles";
import serverStatus from "../../services/serverStatus"

import { runningOnWebRenderer } from "../../helpers/utils";

const maxProgress = 9; // this is the number of services for setting up

const calculatePercentageProgress = (progress: number, maxProgress: number) => {
  if (!Number.isFinite(progress / maxProgress)) {
    return 100;
  }

  return Math.floor((progress / maxProgress) * 100);
};

export type Props = {
  globalError?: boolean;
  goToPreviousPage?: () => void;
};

export default ({
  globalError = false,
  goToPreviousPage,
}: Props) => {
  const history = useHistory()
  const [isSettingUpDevice, setIsSettingUpDevice] = useState(false);
  const [rebootError, setRebootError] = useState(false);
  const [progressMessage, setProgressMessage] = useState(
    "Alright let's get started!"
  );
  const [progress, setProgress] = useState(0);


  function safelyRunService(service: () => Promise<void>, message: string) {
    return service()
      .then(() => setProgressMessage(message))
      .catch(() =>
        setProgressMessage(
          "I couldn't do that, please contact support if I have any problems..."
        )
      )
      .finally(() => {
        setProgress(currentProgess =>
          Math.min(currentProgess + 1, maxProgress)
        );
      });
  }

  function waitUntilServerIsOnline() {
    const interval = setInterval(async () => {
      try {
        await serverStatus({ timeout: 1250 });
        setProgressMessage("The device is back online!");
        clearInterval(interval);
        history.push("/");
        window.location.reload()
      } catch (_) {}
    }, 1500);
  }

  return (
    <RestartPage
      globalError={globalError}
      isSettingUpDevice={isSettingUpDevice}
      rebootError={rebootError}
      progressPercentage={calculatePercentageProgress(progress, maxProgress)}
      progressMessage={progressMessage}
      onBackClick={goToPreviousPage}
      setupDevice={() => {
        setIsSettingUpDevice(true);

        safelyRunService(
          updateMimeDatabase,
          "Just finished memorising all the files I can use..."
        )
          .finally(() =>
            safelyRunService(
              disableStartupNoise,
              "Stopped myself calling out with joy when you turn me on..."
            )
          )
          .finally(() =>
            safelyRunService(
              unhideAllBootMessages,
              "Remembered all the exciting stuff I've got to tell you..."
            )
          )
          .finally(() =>
            safelyRunService(
              enableOSUpdaterService,
              "Reminded myself to keep an eye out for cool new stuff..."
            )
          )
          .finally(() =>
            safelyRunService(
              enableFirmwareUpdaterService,
              "Reminded myself to keep an eye out for cool new stuff for my friends..."
            )
          )
          .finally(() =>
            safelyRunService(
              enableFurtherLinkService,
              "Reminded myself to stay connected, so I can help you go Further..."
            )
          )
          .finally(() =>
            safelyRunService(
              markEulaAgreed,
              "Signed that pesky terms document..."
            )
          )
          .finally(() =>
            safelyRunService(
              deprioritiseOpenboxSession,
              "Put away all my open boxes..."
            )
          )
          .finally(() =>
            safelyRunService(
              restoreFiles,
              "Reminded myself to show you around..."
            )
          )
          .finally(() =>
            safelyRunService(
              configureTour,
              "Reminded myself to show you around..."
            )
          )
          .finally(() =>
            safelyRunService(
              stopOnboardingAutostart,
              "Made sure not to make you go through this again..."
            )
          )
          .catch(console.error)
          .finally(() => {
            reboot()
              .then(() => {
                if (!runningOnWebRenderer()) {
                  setProgressMessage("Rebooting device, please wait until the unit is back online...")
                  window.setTimeout(waitUntilServerIsOnline, 3000);
                }
              })
              .catch(() => {
                setRebootError(true);
                setIsSettingUpDevice(false);
              })
            });
      }}
    />
  );
};
