import React, { useEffect, useState } from "react";

import getVncDesktopUrl from "../../services/getVncDesktopUrl";
import DesktopPage from "./DesktopPage";


export default () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  const getNovncUrl = async () => {
    try {
      const data = await getVncDesktopUrl();
      if (data.url) {
        setUrl(data.url);
      } else {
        setError(true);
      }
    } catch(_) {
      setError(true);
    }
  };

  useEffect(() => {
    getNovncUrl();
  }, []);

  return <DesktopPage
      url={url}
      error={error}
  />
}
