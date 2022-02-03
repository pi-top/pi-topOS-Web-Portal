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

  const [isConnectedViaAp, setIsConnectedViaAp] = useState(false);
  const [disconnectedFromAp, setDisconnectedFromAp] = useState(false);

  useEffect(() => {
    isConnectedThroughAp()
      .then((connectedViaAp) => setIsConnectedViaAp(connectedViaAp))
      .catch(() => null);
  }, []);

  const connect = useCallback(
    (network: Network, password: string) => {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectError(false);

      const requestTimeoutMs = 500;
      const requestIntervalMs = 600;
      const checkConnection = (network: Network) => {
        const connectivityCheckInterval = setInterval(async () => {
          try {
            await connectedBSSID(requestTimeoutMs)
              .then((ssid) => {
                const connectedToSsid = ssid === network.ssid;
                setIsConnected(connectedToSsid)
                if (connectedToSsid) {
                  setConnectedNetwork(network);
                }
              })

            clearInterval(connectivityCheckInterval);
            isConnectedViaAp && setDisconnectedFromAp(false);
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
          isConnectedViaAp && setDisconnectedFromAp(true);
          checkConnection(network);
        })
        .finally(() => {
          setIsConnecting(false);
        });
    },
    [setConnectedNetwork, isConnectedViaAp]
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
