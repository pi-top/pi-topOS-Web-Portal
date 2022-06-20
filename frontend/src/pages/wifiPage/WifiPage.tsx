import React, { useEffect, useState } from "react";

import Layout from "../../components/layout/Layout";
import Select from "../../components/atoms/select/Select";

import wifiPageScreen from "../../assets/images/wifi-screen.png";
import refreshIcon from "../../assets/icons/refresh.svg";
import styles from "./WifiPage.module.css";

import Spinner from "../../components/atoms/spinner/Spinner";
import Button from "../../components/atoms/button/Button";
import ConnectDialogContainer from "./connectDialog/ConnectDialogContainer";
import SkipWarningDialog from "./skipWarningDialog/SkipWarningDialog";
import VNCDialog from "./vncDialog/VNCDialog";
import { Network } from "../../types/Network";
import usePrevious from "../../hooks/usePrevious";

export enum ErrorMessage {
  FetchNetworks = "There was a problem getting networks, please refresh the networks list or skip",
  AdvancedConfigError = "There was a problem opening the advanced network configuration.",
}

export enum ExplanationMessage {
  NotConnected = "Choose from the list below.",
  WiredConnection = "Looks like we're already online. You can still connect to a WiFi network.",
  WiFiConnection = "We've connected successfully.",
}

export type Props = {
  onNextClick?: () => void;
  onSkipClick?: () => void;
  onBackClick?: () => void;
  onRefreshClick: () => void;
  onAdvancedConfigurationDialogClick: () => void;
  networks: Network[];
  isFetchingNetworks: boolean;
  fetchNetworksError: boolean;
  advancedConfigError: boolean;
  isConnected: boolean;
  connectedNetwork?: Network;
  setConnectedNetwork: (network: Network) => void;
  showSkipWarning?: boolean;
};

export default ({
  onNextClick,
  onSkipClick,
  onBackClick,
  onRefreshClick,
  onAdvancedConfigurationDialogClick,
  networks,
  isFetchingNetworks,
  fetchNetworksError,
  advancedConfigError,
  isConnected,
  connectedNetwork,
  setConnectedNetwork,
  showSkipWarning = true,
}: Props) => {
  const previousConnectedNetwork = usePrevious(connectedNetwork);
  const [selectedNetwork, setSelectedNetwork] = useState(connectedNetwork);
  const [isConnectDialogActive, setIsConnectDialogActive] = useState(false);
  const [isAdvancedConfigurationDialogActive, setIsAdvancedConfigurationDialogActive] = useState(false);
  const [isSkipWarningDialogActive, setIsSkipWarningDialogActive] =
    useState(false);

  const { ssid: selectedSSID, bssid: selectedBSSID } = selectedNetwork || {};

  const hasError = fetchNetworksError || advancedConfigError;
  const getErrorMessage = () => {
    if (fetchNetworksError)
      return ErrorMessage.FetchNetworks;
    if (advancedConfigError)
      return ErrorMessage.AdvancedConfigError
  };
  const getExplanation = () => {
    if (connectedNetwork) {
      return ExplanationMessage.WiFiConnection;
    }
    if (isConnected) {
      return ExplanationMessage.WiredConnection;
    }
    return ExplanationMessage.NotConnected;
  };

  const onAdvancedConfigurationDialogButtonClick = () => {
    onAdvancedConfigurationDialogClick();
    setIsAdvancedConfigurationDialogActive(true);
  }

  useEffect(() => {
    if (
      connectedNetwork &&
      previousConnectedNetwork?.bssid !== connectedNetwork?.bssid
    ) {
      setSelectedNetwork(connectedNetwork);
    }
  }, [connectedNetwork, previousConnectedNetwork]);

  return (
    <>
      <Layout
        banner={{
          src: wifiPageScreen,
          alt: "wifi-page-banner",
        }}
        prompt={
          <>
            Connect me to <span className="green">WiFi</span>
          </>
        }
        explanation={getExplanation()}
        nextButton={{
          onClick: onNextClick,
          disabled: !isConnected,
        }}
        skipButton={{
          onClick: () => {
            if (!isConnected && showSkipWarning) {
              setIsSkipWarningDialogActive(true);
            } else if (onSkipClick) {
              onSkipClick();
            }
          },
        }}
        backButton={{ onClick: onBackClick }}
        showBack={!!onBackClick}
        showNext={!!onNextClick}
        showSkip={!!onSkipClick}
      >
        <div className={styles.wifiSelectContainer}>
          <Select
            // force rerender when selected ssid changes
            key={selectedBSSID}
            value={
              selectedBSSID &&
              selectedSSID && {
                value: selectedBSSID,
                label: selectedSSID,
              }
            }
            options={networks.map(({ ssid, bssid }) => ({
              value: bssid,
              label: ssid,
            }))}
            onChange={(newBSSID) => {
              setIsConnectDialogActive(true);
              setSelectedNetwork(
                networks.find((network) => newBSSID === network.bssid)
              );
            }}
            placeholder="Please select WiFi network..."
            isDisabled={isFetchingNetworks}
          />

          <div className={styles.selectDetailsContainer}>
            {isFetchingNetworks ? (
              <>
                <Spinner size={20} />{" "}
                <span className={styles.settingMessage}>
                  fetching networks...
                </span>
              </>
            ) : (
              <Button
                unstyled
                onClick={onRefreshClick}
                className={styles.refreshButton}
              >
                <img src={refreshIcon} alt="refresh-button" />
              </Button>
            )}
          </div>
        </div>

        <span className={styles.advancedConfigButtonContainer}>
          <Button className={styles.advancedConfigButton} unstyled onClick= {() => onAdvancedConfigurationDialogButtonClick()}>Advanced Configuration</Button>
        </span>

        {hasError && <span className={styles.error}>{getErrorMessage()}</span>}
      </Layout>

      <ConnectDialogContainer
        active={isConnectDialogActive}
        network={selectedNetwork}
        setConnectedNetwork={setConnectedNetwork}
        onCancel={() => {
          setIsConnectDialogActive(false);
          setSelectedNetwork(undefined);
        }}
        onDone={() => {
          setIsConnectDialogActive(false);
          if (isConnected && onNextClick) {
            onNextClick();
          }
        }}
      />
      <SkipWarningDialog
        active={isSkipWarningDialogActive}
        onConnectClick={() => setIsSkipWarningDialogActive(false)}
        onSkipClick={onSkipClick || (() => {})}
      />
      <VNCDialog
        active={isAdvancedConfigurationDialogActive}
        onCancel={() => setIsAdvancedConfigurationDialogActive(false)}
      />
    </>
  );
};
