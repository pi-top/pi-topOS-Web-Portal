import React, { useState } from "react";
import { Line as ProgressBar } from "rc-progress";

import Layout from "../../components/layout/Layout";
import Upload from "../../components/upload/Upload";
import updateImage from "../../assets/images/upgrade-page.png";
import styles from "./SchoolPage.module.css";

const getErrorMessage = (error: string) => {
  return `There was a problem with your bundle; please try again (${error}).`;
};

export default () => {
  const [uploadSucceeded, setUploadSucceeded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

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
      prompt={
        <>
          Let's upload your <span className="green">setup bundle</span>!
        </>
      }
      explanation="If you don't have one, download one here. You can also put the bundle file in a USB drive and plug it into your pi-top[4]."
      nextButton={{}}
      showNext={false}
      className={styles.root}
    >
      {!isUploading && !uploadSucceeded && (
        <Upload
          userInstruction="Click to upload your bundle or drag and drop it here"
          filenameRegex={/^pi-top-usb-setup\.tar\.gz$/}
          className={styles.dropzone}
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

      { (isUploading || uploadSucceeded) && (
        <div data-testid="progress" className={styles.progress}>
          <ProgressBar
            percent={progress}
            strokeWidth={3}
            strokeColor="#71c0b4"
          />
          <span data-testid="progress-message" className={styles.text}>
            {isUploading && "Please wait while we upload your bundle; this could take a few minutes ..." }
            {uploadSucceeded && "Bundle uploaded successfully! Please follow the instructions in the pi-top[4] miniscreen to complete the setup."}
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
