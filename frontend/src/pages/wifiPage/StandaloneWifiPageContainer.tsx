import React, { useState, useEffect } from "react";

import WifiPage from "./WifiPage";
import { Network } from "../../types/Network";
import closeWifiWindow from "../../services/closeWifiWindow";
import { runningOnWebRenderer } from "../../helpers/utils";
import getNetworks from "../../services/getNetworks";
import connectedBSSID from "../../services/connectedBSSID";

export default () => {
  const [connectedNetwork, setConnectedNetwork] = useState<Network>();
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(false);
  const [fetchNetworksError, setFetchNetworksError] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);

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

  return (
    <WifiPage
      onRefreshClick={fetchNetworks}
      networks={networks}
      isFetchingNetworks={isFetchingNetworks}
      isConnected={!!connectedNetwork}
      connectedNetwork={connectedNetwork}
      setConnectedNetwork={setConnectedNetwork}
      fetchNetworksError={fetchNetworksError}
      onSkipClick={runningOnWebRenderer() ? closeWifiWindow : undefined}
      skipButtonLabel="Close"
      showSkipWarning={false}
    />
  );
};
