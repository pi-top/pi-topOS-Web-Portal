import React, { useState, useCallback, useEffect, useRef } from "react";

import ConnectDialog from "./ConnectDialog";

import connectToNetwork from "../../../services/connectToNetwork";
import connectedBSSID from "../../../services/connectedBSSID";
import connectedSSID from "../../../services/connectedSSID";

import { Network } from "../../../types/Network";

export type Props = {
  active: boolean;
  onCancel: () => void;
  onDone: () => void;
  setConnectedNetwork: (network: Network) => void;
  network?: Network;
};

export default ({ setConnectedNetwork, ...props }: Props) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  let checkConnectionInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearCheckConnectionInterval = () => {
    if (checkConnectionInterval.current) {
      clearInterval(checkConnectionInterval.current);
      checkConnectionInterval.current = undefined;
    }
  }

  useEffect(() => {
    setIsConnected(false);
  }, [props.network]);

  const requestTimeoutMs = 2000;
  const requestIntervalMs = 1000;
  let elapsedWaitingTimeMs = useRef(0);

  const onConnection = useCallback((network: Network) => {
    clearCheckConnectionInterval();
    setIsConnected(true);
    setIsConnecting(false);
    setConnectError(false);
    setConnectedNetwork(network);
  }, [setConnectError, setConnectedNetwork, setIsConnecting]);

  const checkConnection = useCallback((network: Network) => {
    if (checkConnectionInterval.current) {
      return ;
    }
    elapsedWaitingTimeMs.current = 0;
    checkConnectionInterval.current = setInterval(async () => {
      if (elapsedWaitingTimeMs.current > 30_000) {
        // failed to connect, display dialog with error message
        setConnectError(true);
        setIsConnecting(false);
      } else {
        elapsedWaitingTimeMs.current += requestIntervalMs;
      }

      // check for BSSID
      await connectedBSSID(requestTimeoutMs)
        .then((bssid) => {
          if (bssid === network.bssid) {
            onConnection(network);
          }
        })
        .catch ((_) => {})

      // check for SSID
      await connectedSSID(requestTimeoutMs)
        .then((ssid) => {
          if (ssid === network.ssid) {
            onConnection(network);
          }
        })
        .catch ((_) => {})

    }, requestIntervalMs);
  }, [setConnectError, setIsConnecting, onConnection]);

  const connect = useCallback(
    (network: Network, password: string) => {
      clearCheckConnectionInterval();
      setIsConnecting(true);
      setIsConnected(false);
      setConnectError(false);

      // check in the background if connection succeeded and update state
      checkConnection(network);

      connectToNetwork({ bssid: network.bssid, password: password }, 30000)
        .catch(() => {})
    },
    [checkConnection]
  );

  return (
    <ConnectDialog
      connect={connect}
      isConnecting={isConnecting}
      connectError={connectError}
      isConnected={isConnected}
      {...props}
      onCancel={() => {
        setConnectError(false);
        props.onCancel();
        clearCheckConnectionInterval();
      }}
      onDone={() => {
        setConnectError(false);
        props.onDone();
        clearCheckConnectionInterval();
      }}
    />
  );
};
