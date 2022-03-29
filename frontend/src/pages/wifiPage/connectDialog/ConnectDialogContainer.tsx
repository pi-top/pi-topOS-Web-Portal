import React, { useState, useCallback, useEffect } from "react";

import ConnectDialog from "./ConnectDialog";
import Dialog from "../../../components/atoms/dialog/Dialog";
import ImageComponent from "../../../components/atoms/image/Image";

import connectToNetwork from "../../../services/connectToNetwork";
import isConnectedThroughAp from "../../../services/isConnectedThroughAp";
import connectedBSSID from "../../../services/connectedBSSID";

import { Network } from "../../../types/Network";
import connectToWifiImage from "../../../assets/images/connect-to-wifi.png";

import styles from "./ConnectDialog.module.css";

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

  // preload 'connect-to-wifi' image since it can't be loaded when it is shown
  useEffect(() => {
    const image = new Image()
    image.src = connectToWifiImage
  }, [])

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
            await connectedBSSID(requestTimeoutMs).then((bssid) => {
              connectedToBssid = bssid === network.bssid;
              setIsConnected(connectedToBssid);
              if (connectedToBssid) {
                setConnectError(false);
                setConnectedNetwork(network);
              }
            });

            connectedToBssid && clearInterval(connectivityCheckInterval);
            isUsingAp && setDisconnectedFromAp(false);
          } catch (_) {}
        }, requestIntervalMs);
      };

      connectToNetwork({ bssid: network.bssid, password: password }, 30000)
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

  if (disconnectedFromAp) {
    return (
      <Dialog
        active
        title="Reconnect to pi-top hotspot"
        message={
          <>
            Your computer has disconnected from the{" "}
            <span className="green">pi-top-XXXX</span> Wi-Fi hotspot. Please
            reconnect to it to continue onboarding...
          </>
        }
      >
        <ImageComponent
          src={connectToWifiImage}
          alt="Reconnect to pitop hotspot"
          className={styles.reconnectImage}
        />
      </Dialog>
    );
  }

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
