import React, { useState, useEffect } from "react";

import WifiPage from "./WifiPage";
import { Network } from "../../types/Network";
import getNetworks from "../../services/getNetworks";
import wifiConnectionInformation from "../../services/wifiConnectionInformation";
import HotspotDisconnectDialog from "../hotspotDisconnectDialog/HotspotDisconnectDialog";

export default () => {
  const [connectedNetwork, setConnectedNetwork] = useState<Network>();
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(false);
  const [fetchNetworksError, setFetchNetworksError] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);

  const fetchNetworks = () => {
    setIsFetchingNetworks(true);
    setFetchNetworksError(false);

    Promise.all([getNetworks(), wifiConnectionInformation()])
      .then(([getNetworksResponse, wifiConnectionInformationResponse]) => {
        setNetworks(getNetworksResponse);

        const currentConnectedNetwork = getNetworksResponse.find(
          (network) => network.bssid === wifiConnectionInformationResponse.bssid || network.ssid === wifiConnectionInformationResponse.ssid || wifiConnectionInformationResponse.bssidsForSsid.includes(network.bssid)
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
    <>
      <WifiPage
        onRefreshClick={fetchNetworks}
        networks={networks}
        isFetchingNetworks={isFetchingNetworks}
        isConnected={!!connectedNetwork}
        connectedNetwork={connectedNetwork}
        setConnectedNetwork={setConnectedNetwork}
        fetchNetworksError={fetchNetworksError}
        showSkipWarning={false}
      />
      <HotspotDisconnectDialog />
    </>
  );
};
