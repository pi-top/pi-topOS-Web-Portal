import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';

import RestartPage from "./RestartPage";

import configureLanding from "../../services/configureLanding";
import deprioritiseOpenboxSession from "../../services/deprioritiseOpenboxSession";
import enableFirmwareUpdaterService from "../../services/enableFirmwareUpdaterService";
import enableFurtherLinkService from "../../services/enableFurtherLinkService";
import stopOnboardingAutostart from "../../services/stopOnboardingAutostart";
import reboot from "../../services/reboot";
import setHubToMode5 from "../../services/setHubToMode5";
import restoreFiles from "../../services/restoreFiles";
import serverStatus from "../../services/serverStatus"
import updateEeprom from "../../services/updateEeprom"
import enablePtMiniscreen from "../../services/enablePtMiniscreen";
import updateHubFirmware from "../../services/updateHubFirmware";
import getBuildInfo from "../../services/getBuildInfo";

import { runningOnWebRenderer } from "../../helpers/utils";
import getHubFirmwareUpdateIsDue from "../../services/getHubFirmwareUpdateIsDue";

const maxProgress = 11; // this is the number of services for setting up

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
  const history = useHistory();
  const [isSettingUpDevice, setIsSettingUpDevice] = useState(false);
  const [rebootError, setRebootError] = useState(false);
  const [progressMessage, setProgressMessage] = useState("Alright let's get started!");
  const [progress, setProgress] = useState(0);
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  const [serverRebooted, setServerRebooted] = useState(false);
  const [legacyHubFirmware, setLegacyHubFirmware] = useState(false);
  const [displayManualPowerOnDialog, setDisplayManualPowerOnDialog] = useState(false);

  useEffect(() => {
    getBuildInfo()
      .then((buildInfo) => {
        const versionArray = buildInfo.hubFirmwareVersion.split(".");
        setLegacyHubFirmware(versionArray.length >= 2 && parseInt(versionArray[0]) <= 3 && parseInt(versionArray[1]) === 0);
      })
      .catch(() => setLegacyHubFirmware(false))
  }, [])

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

  const rebootTimeoutMs = 120000;
  const timeoutServerStatusRequestMs = 500;
  const serverStatusRequestIntervalMs = 1500;
  let elapsedWaitingTimeMs = 0;

  function waitUntilServerIsOnline() {
    const interval = setInterval(async () => {
      try {
        elapsedWaitingTimeMs += timeoutServerStatusRequestMs + serverStatusRequestIntervalMs;
        elapsedWaitingTimeMs >= rebootTimeoutMs && setRebootError(true);
        await serverStatus({ timeout: timeoutServerStatusRequestMs });
        setServerRebooted(true);
        setIsWaitingForServer(false);
        clearInterval(interval);
        history.push("/");
        window.location.reload()
      } catch (_) {}
    }, serverStatusRequestIntervalMs);
  }

  function rebootPiTop() {
    reboot()
      .then(() => {
        if (!runningOnWebRenderer()) {
          setIsSettingUpDevice(false);
          setIsWaitingForServer(true);
          setServerRebooted(false);
          window.setTimeout(waitUntilServerIsOnline, 3000);
        }
      })
      .catch(() => {
        setRebootError(true);
        setIsSettingUpDevice(false);
      })
  }


  return (
    <RestartPage
      displayManualPowerOnDialog={displayManualPowerOnDialog}
      onManualPowerOnDialogClose={rebootPiTop}
      isWaitingForServer={isWaitingForServer}
      serverRebooted={serverRebooted}
      globalError={globalError}
      isSettingUpDevice={isSettingUpDevice}
      rebootError={rebootError}
      progressPercentage={calculatePercentageProgress(progress, maxProgress)}
      progressMessage={progressMessage}
      onBackClick={goToPreviousPage}
      setupDevice={() => {
        setIsSettingUpDevice(true);

        safelyRunService(
          enableFirmwareUpdaterService,
          "Reminded myself to keep an eye out for cool new stuff for my friends..."
        )
          .finally(() =>
            safelyRunService(
              enableFurtherLinkService,
              "Reminded myself to stay connected, so I can help you go Further..."
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
              configureLanding,
              "Reminded myself to show you around..."
            )
          )
          .finally(() =>
            safelyRunService(
              stopOnboardingAutostart,
              "Made sure not to make you go through this again..."
            )
          )
          .finally(() =>
            safelyRunService(
              updateHubFirmware,
              "Made things easier for me to go to sleep when you ask..."
            )
          )
          .finally(() =>
            safelyRunService(
              updateEeprom,
              "Made things easier for me to go to sleep when you ask..."
            )
          )
          .finally(() =>
            safelyRunService(
              enablePtMiniscreen,
              "Reminded myself to tell the miniscreen to do its thing in the morning..."
            )
          )
          .finally(() =>
            safelyRunService(
              setHubToMode5,
              "Made sure that the miniscreen doesn't go to sleep while I reboot..."
            )
          )
          .catch(console.error)
          .finally(() => {
            if (legacyHubFirmware) {
              getHubFirmwareUpdateIsDue()
                .then((dueUpdate) => {
                  setDisplayManualPowerOnDialog(dueUpdate);
                  !dueUpdate && rebootPiTop();
                })
                .catch(() => rebootPiTop())
            } else {
              rebootPiTop();
            }
          })
      }}
    />
  );
};
