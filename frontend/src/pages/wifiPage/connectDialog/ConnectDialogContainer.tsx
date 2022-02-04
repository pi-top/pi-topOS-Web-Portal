import React, { useState, useCallback, useEffect } from "react";

import ConnectDialog from "./ConnectDialog";

import connectToNetwork from "../../../services/connectToNetwork";

import { Network } from "../../../types/Network";
import isConnectedThroughAp from "../../../services/isConnectedThroughAp";
import connectedBSSID from "../../../services/connectedBSSID";

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

  const [isUsingAp, setIsUsingAp] = useState(false);
  const [disconnectedFromAp, setDisconnectedFromAp] = useState(false);

  useEffect(() => {
    isConnectedThroughAp()
      .then((connectedViaAp) => setIsUsingAp(connectedViaAp))
      .catch(() => null);
  }, [setIsUsingAp]);

  const connect = useCallback(
    (network: Network, password: string) => {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectError(false);

      const requestTimeoutMs = 1500;
      const requestIntervalMs = 2000;
      const checkConnection = (network: Network) => {
        const connectivityCheckInterval = setInterval(async () => {
          try {
            let connectedToBssid = false;
            await connectedBSSID(requestTimeoutMs)
              .then((bssid) => {
                connectedToBssid = bssid === network.bssid;
                setIsConnected(connectedToBssid)
                if (connectedToBssid) {
                  setConnectError(false);
                  setConnectedNetwork(network);
                }
              })

            connectedToBssid && clearInterval(connectivityCheckInterval);
            isUsingAp && setDisconnectedFromAp(false);
          } catch (_) {}
        }, requestIntervalMs);
      }

      connectToNetwork({ bssid: network.bssid, password: password }, 15000)
        .then(() => {
          setIsConnected(true);
          setConnectedNetwork(network);
        })
        .catch(() => {
          setConnectError(true);
          // keep checking in the background if connection succeeded
          isUsingAp && setDisconnectedFromAp(true);
          checkConnection(network);
        })
        .finally(() => {
          setIsConnecting(false);
        });
    },
    [setConnectedNetwork, isUsingAp]
  );

  useEffect(() => {
    setIsConnected(false);
  }, [props.network]);

  return (
    <ConnectDialog
      connect={connect}
      isConnecting={isConnecting}
      connectError={connectError}
      isConnected={isConnected}
      disconnectedFromAp={disconnectedFromAp}
      {...props}
      onCancel={() => {
        setConnectError(false);
        props.onCancel();
      }}
      onDone={() => {
        setConnectError(false);
        props.onDone();
      }}
    />
  );
};
