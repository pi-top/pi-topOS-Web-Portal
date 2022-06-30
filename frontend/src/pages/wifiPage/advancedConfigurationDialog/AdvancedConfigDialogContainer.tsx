import React, { useState, useEffect, useCallback } from "react";

import usePrevious from "../../../hooks/usePrevious";
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
  const previousActive = usePrevious(active);

  const waitForUrlTimeout = 700;

  const waitForUrl = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getVncWpaGuiUrl();
        if (typeof data.url === 'string') {
          clearInterval(interval);
          setUrl(data.url);
        }
      } catch (_) {}
    }, waitForUrlTimeout);
  }, []);

  const startAdvancedWifiConfig = useCallback(async () => {
    try {
      await startVncWpaGui();
      setTimeout(waitForUrl, 300);
    } catch (_) {
      setError(true);
    }
  }, [waitForUrl]);

  useEffect(() => {
    if (active && !previousActive) {
      startAdvancedWifiConfig();
    };
  }, [active, previousActive, startAdvancedWifiConfig]);

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
