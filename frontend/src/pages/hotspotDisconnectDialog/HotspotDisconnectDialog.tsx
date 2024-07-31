import React, { useEffect, useState } from "react";
import serverStatus from "../../services/serverStatus";
import isConnectedThroughAp from "../../services/isConnectedThroughAp";
import Dialog from "../../components/atoms/dialog/Dialog";
import ImageComponent from "../../components/atoms/image/Image";
import connectToWifiImage from "../../assets/images/connect-to-wifi.png";
import styles from "./HotspotDisconnectDialog.module.css";

export type Props = {
  enabled?: boolean;
};

export default ({ enabled = true }: Props) => {
  const [disconnectedFromAp, setDisconnectedFromAp] = useState(false);
  const [requestFailures, setRequestFailures] = useState(0);
  const MAX_DISCONNECT_REQUESTS = 5;

  // preload 'connect-to-wifi' image since it can't be loaded when it is shown
  useEffect(() => {
    const image = new Image();
    image.src = connectToWifiImage;
  }, []);

  useEffect(() => {
    setDisconnectedFromAp(requestFailures >= MAX_DISCONNECT_REQUESTS);
  }, [requestFailures]);

  useEffect(() => {
    // when connected to the pi-top hotspot, monitor disconnections
    isConnectedThroughAp()
      .then((connectedViaAp) => {
        if (!connectedViaAp) {
          return;
        }

        setInterval(async () => {
          serverStatus({ timeout: 1000 })
            .then(() => setRequestFailures(0))
            .catch(() => setRequestFailures(prevCount => prevCount + 1));
        }, 1000);
      })
      .catch(() => null);
  }, [setDisconnectedFromAp, setRequestFailures]);

  return (
    <Dialog
      active={enabled && disconnectedFromAp}
      title="Reconnect to pi-top hotspot"
      testId="reconnect-ap-dialog"
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
};
