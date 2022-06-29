import React, { useState, useEffect } from "react";
import getVncWpaGuiUrl from "../../../services/getVncWpaGuiUrl";
import startVncWpaGui from "../../../services/startVncWpaGui";
import stopVncWpaGui from "../../../services/stopVncWpaGui";

import AdvancedConfigDialog from "./AdvancedConfigDialog";

export type Props = {
  active: boolean;
  onClose: () => void;
};

export default ({ ...props }: Props) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  const waitForUrlTimeout = 700;

  const waitForUrl = () => {
    const interval = setInterval(async () => {
      try {
        const data = await getVncWpaGuiUrl();
        if (data.url !== "") {
          clearInterval(interval);
          setUrl(data.url);
        }
      } catch (_) {}
    }, waitForUrlTimeout);
  }

  useEffect(() => {
    if (props.active) {
      startAdvancedWifiConfig();
    };
  }, [props.active]); // eslint-disable-line react-hooks/exhaustive-deps

  const startAdvancedWifiConfig = () => {
    startVncWpaGui()
      .then(() => setTimeout(waitForUrl, 300))
      .catch(() => setError(true))
  };

  const stopAdvancedWifiConfig = () => {
    setUrl("")
    stopVncWpaGui()
      .catch(() => setError(true))
  };

  return (
    <AdvancedConfigDialog
      active={props.active}
      url={url}
      onClose={() => {
          stopAdvancedWifiConfig();
          props.onClose();
        }
      }
      error={error}
    />
  );
};
