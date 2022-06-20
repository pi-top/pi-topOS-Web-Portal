import React, { useState, useEffect } from "react";

import WifiPage from "./WifiPage";

import getNetworks from "../../services/getNetworks";
import isConnectedToNetwork from "../../services/isConnectedToNetwork";

import { Network } from "../../types/Network";
import startVncWpaGui from "../../services/startVncWpaGui";

export type Props = {
  goToNextPage: (isConnected: boolean) => void;
  goToPreviousPage: () => void;
  connectedNetwork?: Network;
  setConnectedNetwork: (network: Network) => void;
};

export default ({
  goToNextPage,
  goToPreviousPage,
  connectedNetwork,
  setConnectedNetwork,
}: Props) => {
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(false);
  const [fetchNetworksError, setFetchNetworksError] = useState(false);
  const [advancedConfigError, setAdvancedConfigError] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchNetworks = () => {
    setIsFetchingNetworks(true);

    getNetworks()
      .then((getNetworksResponse) => setNetworks(getNetworksResponse))
      .catch(() => setFetchNetworksError(true))
      .finally(() => setIsFetchingNetworks(false));
  };

  const internetConnectionStatus = () => {
    isConnectedToNetwork()
      .then((isConnectedToNetworkResponse) =>
        setIsConnected(isConnectedToNetworkResponse.connected)
      )
      .catch(() => setIsConnected(false));
  };

  const startWpaGui = () => {
    startVncWpaGui()
      .catch(() => setAdvancedConfigError(true))
  };

  useEffect(() => {
    Promise.all([fetchNetworks(), internetConnectionStatus()]);
  }, []);

  useEffect(() => {
    if (connectedNetwork)
    {
      setIsConnected(true);
    }
  }, [connectedNetwork])

  return (
    <WifiPage
      onNextClick={() => goToNextPage(isConnected)}
      onSkipClick={() => goToNextPage(isConnected)}
      onBackClick={goToPreviousPage}
      onRefreshClick={fetchNetworks}
      onAdvancedConfigurationDialogClick={startWpaGui}
      networks={networks}
      isFetchingNetworks={isFetchingNetworks}
      isConnected={isConnected}
      connectedNetwork={connectedNetwork}
      setConnectedNetwork={setConnectedNetwork}
      fetchNetworksError={fetchNetworksError}
      advancedConfigError={advancedConfigError}
    />
  );
};
