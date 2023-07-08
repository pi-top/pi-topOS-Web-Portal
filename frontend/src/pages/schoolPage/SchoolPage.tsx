import React, { useState } from "react";
import { Line as ProgressBar } from "rc-progress";

import Layout from "../../components/layout/Layout";
import Upload from "../../components/upload/Upload";
import updateImage from "../../assets/images/upgrade-page.png";
import styles from "./SchoolPage.module.css";

const getErrorMessage = (error: string) => {
  return `There was a problem with your bundle; please try again (${error}).`;
};

export type Props = {
  onBackButtonClick?: () => void;
};

export default ({
  onBackButtonClick,
}: Props) => {
  const [uploadSucceeded, setUploadSucceeded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const getPrompt = () => {
    if (uploadSucceeded) {
      return <>Bundle uploaded <span className="green">successfully</span>!</>;
    }
    return <>Let's upload your <span className="green">setup bundle</span>!</>;
  }

  const getExplanation = () => {
    if (uploadSucceeded) {
      return <>
        <p>Please follow the instructions in the pi-top[4] miniscreen to complete the setup.</p>
        <p>Once the process is complete, sign up on <a className={styles.link} href="https://further.pi-top.com">further.pi-top.com</a> to start teaching with your device.</p>
      </>
    }
    return <>
      <p>If you don't have a setup bundle, download one <a className={styles.link} href="https://further.pi-top.com/setup-devices">here</a>.</p>
      <p>When configuring multiple devices, it may be faster to put this file on a USB and plug it into each pi-top[4].</p>
    </>
  }

  const onProgress = (progressEvent: ProgressEvent) => {
    const { loaded, total } = progressEvent;
    let percent = Math.floor((loaded * 100) / total);
    setProgress(percent);
  };

  return (
    <Layout
      banner={{
        src: updateImage,
        alt: "school-banner",
      }}
      prompt={getPrompt()}
      explanation={getExplanation()}
      nextButton={{}}
      showNext={false}
      showBack={onBackButtonClick !== undefined }
      backButton={{
        onClick: onBackButtonClick,
        disabled: isUploading,
      }}
      className={styles.root}
    >
      {!isUploading && !uploadSucceeded && (
        <Upload
          userInstruction="Click to upload your bundle or drag and drop it here"
          filenameRegex={/^pi-top-usb-setup\.tar\.gz$/}
          onUploadStart={() => {
            setError("");
            setUploadSucceeded(false);
            setIsUploading(true);
          }}
          onUploadEnd={() => {
            setUploadSucceeded(true);
            setIsUploading(false);
          }}
          onUploadError={(e) => {
            setError(e);
            setIsUploading(false);
          }}
          supportedExtensions={["gz"]}
          disabled={false}
          onUploadProgress={onProgress}
        />
      )}

      { isUploading && (
        <div data-testid="progress" className={styles.progress}>
          <ProgressBar
            percent={progress}
            strokeWidth={3}
            strokeColor="#71c0b4"
          />
          <span data-testid="progress-message" className={styles.text}>
            Please wait while we upload your bundle; this could take a few minutes ...
          </span>
        </div>
      )}

      {error && (
        <span data-testid="error-message" className={styles.error}>
          {getErrorMessage(error)}
        </span>
      )}

    </Layout>
  );
};
