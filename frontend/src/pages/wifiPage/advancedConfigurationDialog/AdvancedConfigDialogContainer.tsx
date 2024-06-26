import React, { useState, useEffect } from "react";
import apiBaseUrl from "../../../services/apiBaseUrl";
import getVncAdvancedWifiGuiUrl from "../../../services/getVncAdvancedWifiGuiUrl";
import startVncAdvancedWifiGui from "../../../services/startVncAdvancedWifiGui";
import stopVncAdvancedWifiGui from "../../../services/stopVncAdvancedWifiGui";

import AdvancedConfigDialog from "./AdvancedConfigDialog";

export type Props = {
  active: boolean;
  onClose: () => void;
};

export const startPollDelay = 300;
export const pollTime = 700;
export const stopPollTime = 10_000;

export default ({ active, onClose }: Props) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let startPollTimeout: ReturnType<typeof setTimeout>;
    let pollInterval: ReturnType<typeof setInterval>;
    let stopPollTimeout: ReturnType<typeof setTimeout>;

    const waitForUrl = () => {
      stopPollTimeout = setTimeout(() => {
        clearInterval(pollInterval);
        setError(true);
      }, stopPollTime);

      pollInterval = setInterval(async () => {
        try {
          const data = await getVncAdvancedWifiGuiUrl();

          if (data.url) {
            clearTimeout(stopPollTimeout);
            clearInterval(pollInterval);
            setUrl(data.url);
          }
        } catch (_) {}
      }, pollTime);
    };

    const startAdvancedWifiConfig = async () => {
      try {
        await startVncAdvancedWifiGui();
        startPollTimeout = setTimeout(waitForUrl, startPollDelay);
      } catch (_) {
        setError(true);
      }
    };

    if (active) {
      setError(false);
      startAdvancedWifiConfig();
    };

    return () => {
      clearTimeout(startPollTimeout);
      clearInterval(pollInterval);
      clearTimeout(stopPollTimeout);
    };
  }, [active]);

  const stopAdvancedWifiConfig = async () => {
    setUrl("")
    try {
      await stopVncAdvancedWifiGui()
    } catch (_) {
      setError(true);
    }
  };


  // stop pt-web-vnc if user leaves page
  useEffect(() => {
    const handleClose = () => {
      if (window.document.visibilityState === "hidden") {
        navigator.sendBeacon(`${apiBaseUrl}/stop-vnc-wifi-advanced-connection`);
      }
    }
    window.addEventListener("unload", handleClose);
    return () => window.removeEventListener("unload", handleClose);
  }, []);

  return (
    <AdvancedConfigDialog
      active={active}
      url={url}
      onClose={() => {
          stopAdvancedWifiConfig();
          onClose();
        }
      }
      error={error}
    />
  );
};
