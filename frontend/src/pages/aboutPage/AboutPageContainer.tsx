import React, { useState, useEffect } from "react";

import AboutPage from "./AboutPage";

import getAboutDevice from "../../services/getAboutDevice";

export default () => {
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [deviceData, setDeviceData] = useState({});
  const [error, setError] = useState(false);

  const getDeviceData = () => {
    setError(false);
    setIsFetchingData(true);

    getAboutDevice()
      .then((data) => {
          setDeviceData(data);
        })
      .catch(() => {
            setError(true);
        })
      .finally(() => setIsFetchingData(false))
  };

  useEffect(() => {
    Promise.all([getDeviceData()]);
  }, []);

  return (
    <AboutPage
        hasError={error}
        isFetchingData={isFetchingData}
        deviceData={deviceData}
    />
    );
};
