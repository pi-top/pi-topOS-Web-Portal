import React, { useState, useEffect } from "react";

import WifiPage from "./WifiPage";
import { Network } from "../../types/Network";
import getNetworks from "../../services/getNetworks";
import connectedBSSID from "../../services/connectedBSSID";
import getVncWpaGuiUrl from "../../services/getVncWpaGuiUrl";
import startVncWpaGui from "../../services/startVncWpaGui";
import stopVncWpaGui from "../../services/stopVncWpaGui";

export default () => {
  const [connectedNetwork, setConnectedNetwork] = useState<Network>();
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(false);
  const [fetchNetworksError, setFetchNetworksError] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [advancedConfigUrl, setAdvancedConfigUrl] = useState("");
  const [advancedConfigError, setAdvancedConfigError] = useState(false);

  const fetchNetworks = () => {
    setIsFetchingNetworks(true);
    setFetchNetworksError(false);

    Promise.all([getNetworks(), connectedBSSID()])
      .then(([getNetworksResponse, connectedBSSIDResponse]) => {
        setNetworks(getNetworksResponse);

        const currentConnectedNetwork = getNetworksResponse.find(
          (network) => network.bssid === connectedBSSIDResponse
        );
        if (currentConnectedNetwork) {
          setConnectedNetwork(currentConnectedNetwork);
        }
      })
      .catch(() => setFetchNetworksError(true))
      .finally(() => setIsFetchingNetworks(false));
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const waitForAdvancedConfigUrlTimeout = 700;

  const waitForAdvancedConfigUrl = () => {
    const interval = setInterval(async () => {
      try {
        const data = await getVncWpaGuiUrl();
        if (data.url !== "") {
          clearInterval(interval);
          setAdvancedConfigUrl(data.url);
        }
      } catch (_) {}
    }, waitForAdvancedConfigUrlTimeout);
  }

  const startAdvancedWifiConfig = () => {
    startVncWpaGui()
      .then(() => setTimeout(waitForAdvancedConfigUrl, 300))
      .catch(() => setAdvancedConfigError(true))
  };

  const stopAdvancedWifiConfig = () => {
    setAdvancedConfigUrl("")
    stopVncWpaGui()
      .catch(() => setAdvancedConfigError(true))
  };

  return (
    <WifiPage
      onRefreshClick={fetchNetworks}
      onAdvancedConfigurationDialogOpen={startAdvancedWifiConfig}
      onAdvancedConfigurationDialogClose={stopAdvancedWifiConfig}
      networks={networks}
      isFetchingNetworks={isFetchingNetworks}
      isConnected={!!connectedNetwork}
      connectedNetwork={connectedNetwork}
      setConnectedNetwork={setConnectedNetwork}
      fetchNetworksError={fetchNetworksError}
      showSkipWarning={false}
      advancedConfigError={advancedConfigError}
      advancedConfigUrl={advancedConfigUrl}
    />
  );
};
