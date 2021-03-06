import React, { useState, useEffect } from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";
import Input from "../../../components/atoms/input/Input";
import Image from "../../../components/atoms/image/Image";
import CheckBox from "../../../components/atoms/checkBox/CheckBox";
import Spinner from "../../../components/atoms/spinner/Spinner";

import styles from "./ConnectDialog.module.css";
import connectedSuccessfullyImage from "../../../assets/images/connected-successfully.png";
import { Network } from "../../../types/Network";

export type Props = {
  active: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connectError: boolean;
  connect: (network: Network, password: string) => void;
  onCancel: () => void;
  onDone: () => void;
  network?: Network;
};

export default ({
  active,
  isConnecting,
  isConnected,
  onCancel,
  onDone,
  connectError,
  connect,
  network,
}: Props) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPassword("");
  }, [network]);

  const { ssid, passwordRequired } = network || {};

  const getMessage = () => {
    if (isConnected) {
      return <>Great, your pi-top is connected to <span className="green">{ssid}</span>!</>;
    }

    if (isConnecting) {
      return <>Connecting to <span className="green">{ssid}</span>...</>;
    }

    return (
      <>
        The WiFi network <span className="green">{ssid}</span>{" "}
        {passwordRequired ? "requires" : "does not require"} a password
      </>
    );
  };

  return (
    <Dialog
      testId="connect-dialog"
      className={styles.dialog}
      active={active}
      message={getMessage()}
    >
      <div className={styles.content}>
        {isConnecting && <Spinner size={50} />}

        {!(isConnecting || isConnected) && passwordRequired && (
          <div className={styles.passwordControls}>
            <Input
              id="connect-dialog-password"
              label="Enter password below"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              className={styles.password}
            />

            <CheckBox
              name="show-password"
              label="show password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className={styles.checkbox}
            />
          </div>
        )}

        {isConnected && (
          <Image
            src={connectedSuccessfullyImage}
            alt="connected-successfully"
            imageScale={1}
            className={styles.successImage}
          />
        )}

        {!isConnecting && connectError && (
          <span className={styles.error}>
                There was an error connecting to {ssid}... please check your
                password and try again
          </span>
        )}

        <div className={styles.actions}>
          <Button
            onClick={onCancel}
            disabled={isConnecting || isConnected}
            className={styles.cancel}
            unstyled
          >
            Cancel
          </Button>

          {isConnected ? (
            <PrimaryButton onClick={() => onDone()}>OK</PrimaryButton>
          ) : (
            <PrimaryButton
              disabled={isConnecting}
              onClick={() => network && connect(network, password)}
            >
              {connectError ? "Retry" : "Join"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </Dialog>
  );
};
