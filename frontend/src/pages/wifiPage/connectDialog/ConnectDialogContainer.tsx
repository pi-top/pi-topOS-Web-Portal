import React, { useState, useCallback, useEffect } from "react";

import ConnectDialog from "./ConnectDialog";

import connectToNetwork from "../../../services/connectToNetwork";

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

  const connect = useCallback(
    (network: Network, password: string) => {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectError(false);

      connectToNetwork({ bssid: network.bssid, password: password })
        .then(() => {
          setIsConnected(true);
          setConnectedNetwork(network);
        })
        .catch(() => setConnectError(true))
        .finally(() => setIsConnecting(false));
    },
    [setConnectedNetwork]
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
