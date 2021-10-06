import React, { useCallback, useState, useEffect } from "react";

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
  State = "STATE",
}

export enum UpdateMessageStatus {
  Start = "START",
  Finish = "FINISH",
  Error = "ERROR",
  Status = "STATUS",
}

export enum UpdateState {
  None = "NONE",
  Error = "ERROR",
  WaitingForServer = "WAITING_FOR_SERVER",
  UpdatingSources = "UPDATING_SOURCES",
  PreparingWebPortal = "PREPARING_WEBPORTAL",
  PreparingSystemUpgrade = "PREPARING_SYSTEM_UPGRADE",
  UpgradingWebPortal = "UPGRADING_WEB_PORTAL",
  WaitingForUserInput = "WAITING_FOR_USER_INPUT",
  UpgradingSystem = "UPGRADING_SYSTEM",
  Finished = "FINISHED",
}

export enum ErrorType {
  None,
  GenericError,
  NoSpaceAvailable,
  ClientExists,
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

export type StateMessagePayload = {
  clients: number;
  busy: boolean;
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

export type StateMessage = {
  type: OSUpdaterMessageType.State;
  payload: StateMessagePayload;
};

export type OSUpdaterMessage = UpgradeMessage | SizeMessage | StateMessage;

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

  const [updateSize, setUpdateSize] = useState({downloadSize: 0, requiredSpace: 0});
  const [error, setError] = useState<ErrorType>(ErrorType.None);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [requireBurn, setRequireBurn] = useState(false);
  const [shouldBurn, setShouldBurn] = useState(false);
  const [reattach, setReattach] = useState(false);
  const [state, setState] = useState<UpdateState>(UpdateState.None)

  let checkingWebPortal = window.location.search !== "?all";
  useEffect(() => {
    if (!checkingWebPortal) {
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
    getAvailableSpace()
      .then((setAvailableSpace))
      .catch(() => setError(ErrorType.GenericError));
  }, []);

  useEffect(() => {
    error !== ErrorType.None && setState(UpdateState.Error);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      socket.send("default-updater-backend");
      socket.send("state");
    }
  }, [isOpen, socket]);

  useEffect(() => {
    if (!isOpen) {
      return ;
    }
    console.log("APP STATE: ", state);
    state === UpdateState.UpdatingSources && socket.send("update_sources");
    state === UpdateState.PreparingWebPortal && socket.send("prepare_web_portal");
    state === UpdateState.PreparingSystemUpgrade && socket.send("prepare");

  }, [isOpen, socket, state]);


  const doRetry = useCallback(
    (defaultBackend: boolean) => {
      socket.send(defaultBackend ? "default-updater-backend" : "legacy-updater-backend");
      setError(ErrorType.None);
      setUpdateSize({downloadSize: 0, requiredSpace: 0});
      socket.send("state")
    },
    [],
  )

  useEffect(() => {
    if (reattach) {
      console.log("Recreate existing state ...")
    } else {
      setState(UpdateState.UpdatingSources)
    }
  }, [reattach]);


  useEffect(() => {
    if (availableSpace < updateSize.requiredSpace + updateSize.downloadSize) {
      setError(ErrorType.NoSpaceAvailable);
    }
  }, [updateSize, availableSpace, setError]);

  useEffect(() => {
    socket.onclose = () => {
      state !== UpdateState.Finished && setError(ErrorType.GenericError);
      setIsOpen(false);
    };
  }, [socket, state]);

  useEffect(() => {
    if (!message) {
      return;
    }

    if (message.type === OSUpdaterMessageType.State) {
      if (message.payload.clients < 0) {
        setError(ErrorType.ClientExists);
      } else {
        setReattach(message.payload.busy);
      }
    }

    if (
      (message.type === OSUpdaterMessageType.PrepareUpgrade || message.type === OSUpdaterMessageType.Upgrade)
      && message.payload?.percent
    ) {
        document.title = "[" + message.payload.percent + "%] pi-topOS System Update";
    }

    if (
      message.type === OSUpdaterMessageType.PrepareUpgrade &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      socket.send("size");
      return;
    }

    if (
      message.type === OSUpdaterMessageType.PrepareUpgrade &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(ErrorType.GenericError);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(ErrorType.GenericError);
    }

    if (
      message.type === OSUpdaterMessageType.UpdateSources &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      if (checkingWebPortal) {
        setState(UpdateState.PreparingWebPortal);
      } else {
        setState(UpdateState.PreparingSystemUpgrade);
      }
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Start
    ) {
      if (checkingWebPortal) {
        setState(UpdateState.UpgradingWebPortal);
      } else {
        setState(UpdateState.UpgradingSystem);
      }
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Finish
    ) {
      if (checkingWebPortal) {
        setState(UpdateState.WaitingForServer);
        restartWebPortalService()
          .catch(() => setError(ErrorType.None)) // ignored, request will fail since backend server is restarted
          .finally(() => setTimeout(waitUntilServerIsOnline, 300));
      } else {
        setState(UpdateState.Finished);
      }
    }

    if (
      message.type === OSUpdaterMessageType.Upgrade &&
      message.payload.status === UpdateMessageStatus.Error
    ) {
      setError(ErrorType.GenericError);
    }


    if (message.type === OSUpdaterMessageType.Size) {
      if (!checkingWebPortal || state === UpdateState.PreparingSystemUpgrade){
        setUpdateSize(message.payload.size);
        setState(UpdateState.WaitingForUserInput);
      }

      try {
        const noUpdatesAvailable = !(message.payload.size.downloadSize || message.payload.size.requiredSpace);
        if (noUpdatesAvailable && checkingWebPortal) {
          // no web-portal updates, prepare to update all packages now
          checkingWebPortal = false;
          setState(UpdateState.PreparingSystemUpgrade);
        } else if (noUpdatesAvailable && !checkingWebPortal) {
          // no packages to upgrade, page is now complete
          setState(UpdateState.Finished);
        } else if (state === UpdateState.PreparingWebPortal) {
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
      updateState={state}
      downloadSize={updateSize.downloadSize}
      requireBurn={requireBurn}
      shouldBurn={shouldBurn}
      error={error}
    />
  );
};
