import React, { useState, useEffect } from "react";

import UpgradePage from "./UpgradePage";

import useSocket from "../../hooks/useSocket";
import getAvailableSpace from "../../services/getAvailableSpace";
import wsBaseUrl from "../../services/wsBaseUrl";
import restartWebPortalService from "../../services/restartWebPortalService";
import serverStatus from "../../services/serverStatus"
import getMajorOsUpdates from "../../services/getMajorOsUpdates"

export enum OSUpdaterMessageType {
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
  type: OSUpdaterMessageType.PrepareUpgrade | OSUpdaterMessageType.Upgrade | OSUpdaterMessageType.UpdateSources;
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
  const [, setPreparingWebPortalUpgrade] = useState(true);
  const [installingWebPortalUpgrade, setInstallingWebPortalUpgrade] = useState(false);
  const [, setFinishedInstallingWebPortalUpgrade] = useState(false);

  const [updatingSources, setIsUpdatingSources] = useState(false);
  const [upgradeIsPrepared, setUpgradeIsPrepared] = useState(false);
  const [upgradeIsRequired, setUpgradeIsRequired] = useState(true);
  const [upgradeIsRunning, setUpgradeIsRunning] = useState(false);
  const [upgradeFinished, setUpgradeFinished] = useState(false);
  const [updateSize, setUpdateSize] = useState({downloadSize: 0, requiredSpace: 0});
  const [error, setError] = useState(false);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [waitingForServer, setWaitingForServer] = useState(false);
  const [requireBurn, setRequireBurn] = useState(false);
  const [shouldBurn, setShouldBurn] = useState(false);

  useEffect(() => {
    getAvailableSpace()
      .then((setAvailableSpace))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (checkingWebPortal) {
      socket.send("update_sources");
      setIsUpdatingSources(true);
    } else {
      // the page was reloaded after installing web-portal - prepare to update all packages
      socket.send("prepare");
    }
  }, [socket, isOpen, checkingWebPortal]);

  useEffect(() => {
    !checkingWebPortal && getMajorOsUpdates()
      .then((response) => {
        setShouldBurn(response.shouldBurn);
        setRequireBurn(response.requireBurn);
      })
      .catch(() => {
        setShouldBurn(false);
        setRequireBurn(false);
      })
    }, [checkingWebPortal]);

  useEffect(() => {
    if (availableSpace < updateSize.requiredSpace + updateSize.downloadSize) {
      setError(true);
    }
  }, [updateSize, availableSpace, setError]);

  useEffect(() => {
    socket.onclose = () => {
      !upgradeFinished && setError(true);
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
      setError(true);
      setUpgradeIsPrepared(false);
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(true);
      setUpgradeIsRunning(false);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setIsUpdatingSources(false);
      setError(true);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      setIsUpdatingSources(false);
      if (checkingWebPortal) {
        socket.send("prepare_web_portal");
      } else {
        socket.send("prepare");
      }
    }

    if (
      message.type === OSUpdaterMessageType.PrepareUpgrade &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      socket.send("size");
      return;
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      if (checkingWebPortal) {
        setInstallingWebPortalUpgrade(false);
        setFinishedInstallingWebPortalUpgrade(true);

        setWaitingForServer(true);
        restartWebPortalService()
          .catch(() => setError(false)) // ignored, request will fail since backend server is restarted
          .finally(() => setTimeout(waitUntilServerIsOnline, 300))
      } else {
        setUpgradeIsRunning(false);
        setUpgradeIsRequired(false);
        setUpgradeFinished(true);
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
          setPreparingWebPortalUpgrade(false);
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
        setError(true);
      }

      if (message.payload.status === UpdateMessageStatus.Error) {
        setError(true);
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
        elapsedWaitingTimeMs >= serviceRestartTimoutMs && setError(true);
        serverStatus({ timeout: timeoutServerStatusRequestMs })
          .then(() => clearInterval(interval))
          .catch(() => {})
        window.location.replace("/onboarding/upgrade?all")
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
        setError(true);
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
      checkingWebPortal={checkingWebPortal}
      error={error}
      updatingSources={updatingSources}
      installingWebPortalUpgrade={installingWebPortalUpgrade}
    />
  );
};
