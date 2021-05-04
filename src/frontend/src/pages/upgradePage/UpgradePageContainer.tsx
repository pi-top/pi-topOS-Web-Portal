import React, { useState, useEffect } from "react";

import UpgradePage from "./UpgradePage";

import useSocket from "../../hooks/useSocket";
import getAvailableSpace from "../../services/getAvailableSpace";
import wsBaseUrl from "../../services/wsBaseUrl";

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
  const [updateSize, setUpdateSize] = useState({downloadSize: 0, requiredSpace: 0});
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [availableSpace, setAvailableSpace] = useState(0);

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
      setError(true);
      setIsOpen(false);
    };
  }, [socket]);

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
        }
      } catch (_) {
        setError(true);
      }

      if (message.payload.status === UpdateMessageStatus.Error) {
        setError(true);
      }
    }
  }, [message, socket]);

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
      downloadSize={updateSize.downloadSize}
      error={error}
    />
  );
};
