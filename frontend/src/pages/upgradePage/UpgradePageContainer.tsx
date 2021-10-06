import React, { useCallback, useState, useEffect } from "react";

import UpgradePage from "./UpgradePage";

import useSocket from "../../hooks/useSocket";
import getAvailableSpace from "../../services/getAvailableSpace";
import wsBaseUrl from "../../services/wsBaseUrl";
import restartWebPortalService from "../../services/restartWebPortalService";
import serverStatus from "../../services/serverStatus"
import getMajorOsUpdates from "../../services/getMajorOsUpdates"

export enum OSUpdaterMessageType {
  Cleanup = "OS_UPGRADE_CLEANUP",
  UpdateSources = "UPDATE_SOURCES",
  PrepareUpgrade = "OS_PREPARE_UPGRADE",
  Upgrade = "OS_UPGRADE",
  Size = "SIZE",
}

export enum UpdateMessageStatus {
  Start = "START",
  Finish = "FINISH",
  Error = "ERROR",
  Status = "STATUS",
}

export enum ErrorType {
  None,
  GenericError,
  NoSpaceAvailable,
}

export type UpgradeMessagePayload = {
  status: UpdateMessageStatus;
  percent: number;
  message: string;
};

export type SizeMessagePayload = {
  size: {
    downloadSize: number;
    requiredSpace: number;
  };
  status: UpdateMessageStatus;
};

export type UpgradeMessage = {
  type: OSUpdaterMessageType.UpdateSources | OSUpdaterMessageType.PrepareUpgrade | OSUpdaterMessageType.Upgrade | OSUpdaterMessageType.Cleanup;
  payload: UpgradeMessagePayload;
};

export type SizeMessage = {
  type: OSUpdaterMessageType.Size;
  payload: SizeMessagePayload;
};

export type OSUpdaterMessage = UpgradeMessage | SizeMessage;

export type Props = {
  goToNextPage?: () => void;
  goToPreviousPage?: () => void;
  isCompleted?: boolean;
};

export default ({ goToNextPage, goToPreviousPage, isCompleted }: Props) => {
  const [message, setMessage] = useState<OSUpdaterMessage>();
  const [isOpen, setIsOpen] = useState(false);
  document.title = "pi-topOS System Update"

  const socket = useSocket(`${wsBaseUrl}/os-upgrade`, );
  socket.onmessage = (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      setMessage(data);
    } catch (_) {}
  };
  socket.onopen = () => {
    setIsOpen(true);
  }

  const [checkingWebPortal, setCheckingWebPortal] = useState(window.location.search !== "?all");
  const [installingWebPortalUpgrade, setInstallingWebPortalUpgrade] = useState(false);
  const [preparingAll, setIsPreparingAll] = useState(false);
  const [preparingWebPortal, setIsPreparingWebPortal] = useState(false);
  const [updatingSources, setIsUpdatingSources] = useState(false);
  const [upgradeIsPrepared, setUpgradeIsPrepared] = useState(false);
  const [upgradeIsRequired, setUpgradeIsRequired] = useState(true);
  const [upgradeIsRunning, setUpgradeIsRunning] = useState(false);
  const [cleanupIsRunning, setCleanupIsRunning] = useState(false);
  const [upgradeFinished, setUpgradeFinished] = useState(false);
  const [updateSize, setUpdateSize] = useState({downloadSize: 0, requiredSpace: 0});
  const [error, setError] = useState<ErrorType>(ErrorType.None);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [waitingForServer, setWaitingForServer] = useState(false);
  const [requireBurn, setRequireBurn] = useState(false);
  const [shouldBurn, setShouldBurn] = useState(false);

  useEffect(() => {
    getAvailableSpace()
      .then((setAvailableSpace))
      .catch(() => setError(ErrorType.GenericError));
  }, []);

  useEffect(() => {
    isOpen && socket.send("default-updater-backend")
  }, [isOpen, socket]);

  useEffect(() => {
    isOpen && updatingSources && socket.send("update_sources");
  }, [isOpen, socket, updatingSources]);

  useEffect(() => {
    isOpen && preparingAll && socket.send("prepare");
  }, [isOpen, socket, preparingAll]);

  useEffect(() => {
    isOpen && preparingWebPortal && socket.send("prepare_web_portal");
  }, [isOpen, socket, preparingWebPortal]);

  const doRetry = useCallback(
    (defaultBackend: boolean) => {
      socket.send(defaultBackend ? "default-updater-backend" : "legacy-updater-backend");

      // reset all state to defaults and start again
      setError(ErrorType.None);
      // setMessage(undefined);
      setInstallingWebPortalUpgrade(false);
      setIsPreparingAll(false);
      setIsPreparingWebPortal(false);
      setIsUpdatingSources(false);
      setUpgradeIsPrepared(false);
      setUpgradeIsRequired(true);
      setUpgradeIsRunning(false);
      setUpgradeFinished(false);
      setUpdateSize({downloadSize: 0, requiredSpace: 0});
      if (checkingWebPortal) {
        setIsUpdatingSources(true);
      } else {
        setCheckingWebPortal(true);
      }
    },
    [checkingWebPortal],
  )

  useEffect(() => {
    if (checkingWebPortal) {
      setIsUpdatingSources(true);
    } else {
      setIsPreparingAll(true);

      getMajorOsUpdates()
        .then((response) => {
          setShouldBurn(response.shouldBurn);
          setRequireBurn(response.requireBurn);
        })
        .catch(() => {
          setShouldBurn(false);
          setRequireBurn(false);
        })
    }
  }, [checkingWebPortal]);

  useEffect(() => {
    if (availableSpace < updateSize.requiredSpace + updateSize.downloadSize) {
      setError(ErrorType.NoSpaceAvailable);
    }
  }, [updateSize, availableSpace, setError]);

  useEffect(() => {
    socket.onclose = () => {
      !upgradeFinished && setError(ErrorType.GenericError);
      setIsOpen(false);
    };
  }, [socket, upgradeFinished]);

  useEffect(() => {
    if (!message) {
      return;
    }

    if (
      (message.type === OSUpdaterMessageType.PrepareUpgrade || message.type === OSUpdaterMessageType.Upgrade)
      && message.payload?.percent
    ) {
        document.title = "[" + message.payload.percent + "%] pi-topOS System Update";
    }

    if (
      message.type === OSUpdaterMessageType.PrepareUpgrade &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(ErrorType.GenericError);
      setUpgradeIsPrepared(false);
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(ErrorType.GenericError);
      setUpgradeIsRunning(false);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setIsUpdatingSources(false);
      setError(ErrorType.GenericError);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      setIsUpdatingSources(false);
      if (checkingWebPortal) {
        setIsPreparingAll(false);
        setIsPreparingWebPortal(true);
      } else {
        setIsPreparingAll(true);
      }
    }

    if (
      message.type === OSUpdaterMessageType.PrepareUpgrade &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      socket.send("size");
      return;
    }

    if (message.type === OSUpdaterMessageType.Upgrade) {
      if (message.payload.status === UpdateMessageStatus.Finish) {
        setCleanupIsRunning(true);
        socket.send("cleanup");
      } else if (message.payload.status === UpdateMessageStatus.Start) {
        setUpgradeIsRunning(true);
      }
    }

    if (
      message.type === OSUpdaterMessageType.Cleanup &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {

      if (checkingWebPortal) {
        setInstallingWebPortalUpgrade(false);

        setWaitingForServer(true);
        restartWebPortalService()
          .catch(() => setError(ErrorType.None)) // ignored, request will fail since backend server is restarted
          .finally(() => setTimeout(waitUntilServerIsOnline, 300));
      } else {
        setUpgradeIsRunning(false);
        setUpgradeIsRequired(false);
        setUpgradeFinished(true);
        setCleanupIsRunning(false);
      }
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Start
    ) {
      if (checkingWebPortal) {
        setInstallingWebPortalUpgrade(true);
      } else {
        setUpgradeIsRunning(true);
      }
    }

    if (message.type === OSUpdaterMessageType.Size) {
      if (!checkingWebPortal){
        setUpgradeIsPrepared(true);
        setUpdateSize(message.payload.size);
      }

      try {
        const noUpdatesAvailable = !(message.payload.size.downloadSize || message.payload.size.requiredSpace);
        if (noUpdatesAvailable && checkingWebPortal) {
          // no web-portal updates, prepare to update all packages now
          setCheckingWebPortal(false);
        } else if (noUpdatesAvailable && !checkingWebPortal) {
          // no packages to upgrade, page is now complete
          setUpgradeIsRunning(false);
          setUpgradeIsRequired(false);
          setUpgradeFinished(true);
        } else if (checkingWebPortal) {
          // there's an update to pt-os-web-portal, install it
          socket.send("start");
        }
      } catch (_) {
        setError(ErrorType.GenericError);
      }

      if (message.payload.status === UpdateMessageStatus.Error) {
        setError(ErrorType.GenericError);
      }
    }
  }, [message, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  const serviceRestartTimoutMs = 30000;
  const timeoutServerStatusRequestMs = 300;
  const serverStatusRequestIntervalMs = 700;
  let elapsedWaitingTimeMs = 0;

  let waitUntilServerIsOnline = () => {
    const interval = setInterval(async () => {
      try {
        elapsedWaitingTimeMs += timeoutServerStatusRequestMs + serverStatusRequestIntervalMs;
        elapsedWaitingTimeMs >= serviceRestartTimoutMs && setError(ErrorType.GenericError);
        serverStatus({ timeout: timeoutServerStatusRequestMs })
          .then(() => clearInterval(interval))
          .catch(() => {})
        window.location.replace(window.location.pathname + "?all")
      } catch (_) {}
    }, serverStatusRequestIntervalMs);
  }

  return (
    <UpgradePage
      onNextClick={goToNextPage}
      onSkipClick={goToNextPage}
      onBackClick={goToPreviousPage}
      onStartUpgradeClick={() => {
        if (isOpen) {
          socket.send("start");
          return;
        }
        setError(ErrorType.GenericError);
      }}
      onRetry={(useDefaultBackend: boolean) => {
        doRetry(useDefaultBackend)
      }}
      isCompleted={isCompleted}
      message={message}
      upgradeIsPrepared={upgradeIsPrepared}
      upgradeIsRequired={upgradeIsRequired}
      upgradeIsRunning={upgradeIsRunning}
      upgradeFinished={upgradeFinished}
      waitingForServer={waitingForServer}
      downloadSize={updateSize.downloadSize}
      requireBurn={requireBurn}
      shouldBurn={shouldBurn}
      cleanupIsRunning={cleanupIsRunning}
      checkingWebPortal={checkingWebPortal}
      error={error}
      updatingSources={updatingSources}
      installingWebPortalUpgrade={installingWebPortalUpgrade}
    />
  );
};
