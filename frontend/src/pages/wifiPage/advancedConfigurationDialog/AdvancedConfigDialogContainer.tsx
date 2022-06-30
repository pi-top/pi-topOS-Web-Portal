import React, { useState, useEffect } from "react";

import getVncWpaGuiUrl from "../../../services/getVncWpaGuiUrl";
import startVncWpaGui from "../../../services/startVncWpaGui";
import stopVncWpaGui from "../../../services/stopVncWpaGui";

import AdvancedConfigDialog from "./AdvancedConfigDialog";

export type Props = {
  active: boolean;
  onClose: () => void;
};

export default ({ active, onClose }: Props) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  const waitForUrlTimeout = 700;

  useEffect(() => {
    let startPollingTimeout: ReturnType<typeof setTimeout>;
    let pollingInterval: ReturnType<typeof setInterval>;

    const waitForUrl = () => {
      pollingInterval = setInterval(async () => {
        try {
          const data = await getVncWpaGuiUrl();
          if (typeof data.url === 'string') {
            clearInterval(pollingInterval);
            setUrl(data.url);
          }
        } catch (_) {}
      }, waitForUrlTimeout);
    };

    const startAdvancedWifiConfig = async () => {
      try {
        await startVncWpaGui();
        startPollingTimeout = setTimeout(waitForUrl, 300);
      } catch (_) {
        setError(true);
      }
    };

    if (active) {
      startAdvancedWifiConfig();
    };

    return () => {
      clearTimeout(startPollingTimeout);
      clearInterval(pollingInterval);
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
