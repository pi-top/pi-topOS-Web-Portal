import React, { useState, useEffect } from "react";

import getVncWpaGuiUrl from "../../../services/getVncWpaGuiUrl";
import startVncWpaGui from "../../../services/startVncWpaGui";
import stopVncWpaGui from "../../../services/stopVncWpaGui";

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
          const data = await getVncWpaGuiUrl();

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
        await startVncWpaGui();
        startPollTimeout = setTimeout(waitForUrl, startPollDelay);
      } catch (_) {
        setError(true);
      }
    };

    if (active) {
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
      await stopVncWpaGui()
    } catch (_) {
      setError(true);
    }
  };

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
