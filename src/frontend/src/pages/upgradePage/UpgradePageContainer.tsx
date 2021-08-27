import React, { useState, useEffect } from "react";

import UpgradePage from "./UpgradePage";

import useSocket from "../../hooks/useSocket";
import getAvailableSpace from "../../services/getAvailableSpace";
import wsBaseUrl from "../../services/wsBaseUrl";
import restartWebPortalService from "../../services/restartWebPortalService";
import serverStatus from "../../services/serverStatus"

export enum OSUpdaterMessageType {
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
  type: OSUpdaterMessageType.PrepareUpgrade | OSUpdaterMessageType.Upgrade;
  payload: UpgradeMessagePayload;
};

export type SizeMessage = {
  type: OSUpdaterMessageType.Size;
  payload: SizeMessagePayload;
};

export type OSUpdaterMessage = UpgradeMessage | SizeMessage;

export type Props = {
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isCompleted: boolean;
};

export default ({ goToNextPage, goToPreviousPage, isCompleted }: Props) => {
  const socket = useSocket(`${wsBaseUrl}/os-upgrade`);

  const [message, setMessage] = useState<OSUpdaterMessage>();
  const [upgradeIsPrepared, setUpgradeIsPrepared] = useState(false);
  const [upgradeIsRequired, setUpgradeIsRequired] = useState(true);
  const [upgradeIsRunning, setUpgradeIsRunning] = useState(false);
  const [upgradeFinished, setUpgradeFinished] = useState(false);
  const [updateSize, setUpdateSize] = useState({downloadSize: 0, requiredSpace: 0});
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [waitingForServer, setWaitingForServer] = useState(false);

  useEffect(() => {
    getAvailableSpace()
      .then((setAvailableSpace))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (availableSpace < updateSize.requiredSpace + updateSize.downloadSize) {
      setError(true);
    }
  }, [updateSize, availableSpace, setError]);

  useEffect(() => {
    socket.onopen = () => {
      setIsOpen(true);
      socket.send("prepare");
    };
    socket.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setMessage(data);
      } catch (_) {}
    };
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
      setUpgradeIsRunning(false);
      setUpgradeIsRequired(false);
      setUpgradeFinished(true);
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Start
    ) {
      setUpgradeIsRunning(true);
    }

    if (message.type === OSUpdaterMessageType.Size) {
      setUpgradeIsPrepared(true);

      try {
        setUpdateSize(message.payload.size);

        if (!message.payload.size.downloadSize) {
          setUpgradeIsRunning(false);
          setUpgradeIsRequired(false);
          setUpgradeFinished(true);
        }
      } catch (_) {
        setError(true);
      }

      if (message.payload.status === UpdateMessageStatus.Error) {
        setError(true);
      }
    }
  }, [message, socket]);

  const serviceRestartTimoutMs = 30000;
  const timeoutServerStatusRequestMs = 300;
  const serverStatusRequestIntervalMs = 700;
  let elapsedWaitingTimeMs = 0;

  function waitUntilServerIsOnline() {
    const interval = setInterval(async () => {
      try {
        elapsedWaitingTimeMs += timeoutServerStatusRequestMs + serverStatusRequestIntervalMs;
        elapsedWaitingTimeMs >= serviceRestartTimoutMs && setError(true);
        await serverStatus({ timeout: timeoutServerStatusRequestMs });
        clearInterval(interval);
        goToNextPage();
      } catch (_) {}
    }, serverStatusRequestIntervalMs);
  }

  return (
    <UpgradePage
      onNextClick={() => {
        setWaitingForServer(true);
        restartWebPortalService()
          .catch(() => null) // ignored, request will fail since backend server is restarted
          .finally(() => setTimeout(waitUntilServerIsOnline, 300))
      }}
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
      error={error}
    />
  );
};
