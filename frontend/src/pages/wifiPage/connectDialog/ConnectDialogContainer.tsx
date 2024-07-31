import React, { useState, useCallback, useEffect } from "react";

import ConnectDialog from "./ConnectDialog";

import connectToNetwork from "../../../services/connectToNetwork";
import connectedBSSID from "../../../services/connectedBSSID";

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
  const [connectivityCheckInterval, setConnectivityCheckInterval] = useState<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setIsConnected(false);
  }, [props.network]);

  const requestTimeoutMs = 1500;
  const requestIntervalMs = 500;

  const clearCheckConnectionInterval = useCallback(() => {
    connectivityCheckInterval && clearInterval(connectivityCheckInterval);
    setConnectivityCheckInterval(undefined);
  }, [connectivityCheckInterval]);

  const checkConnection = useCallback((network: Network) => {
    if (connectivityCheckInterval) {
      return ;
    }
    setConnectivityCheckInterval(setInterval(async () => {
      try {
        let connectedToBssid = false;
        await connectedBSSID(requestTimeoutMs).then((bssid) => {
          connectedToBssid = bssid === network.bssid;
          setIsConnected(connectedToBssid);
          if (connectedToBssid) {
            setConnectError(false);
            setConnectedNetwork(network);
            clearCheckConnectionInterval();
          }
        });
      } catch (_) {}
    }, requestIntervalMs));
  }, [connectivityCheckInterval, setConnectedNetwork, clearCheckConnectionInterval]);


  const connect = useCallback(
    (network: Network, password: string) => {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectError(false);

      // check in the background if connection succeeded.
      // even if 'connectToNetwork' fails, the pi-top might have connected to the network
      // this could happen when the client disconnects from the pi-top hotpot
      checkConnection(network);

      connectToNetwork({ bssid: network.bssid, password: password }, 30000)
        .then(() => {
          clearCheckConnectionInterval();
          setIsConnected(true);
          setConnectedNetwork(network);
        })
        .catch(() => {
          setConnectError(true);
        })
        .finally(() => {
          setIsConnecting(false);
        });
    },
    [setConnectedNetwork, checkConnection, clearCheckConnectionInterval]
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
