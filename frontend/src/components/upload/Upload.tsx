import React from "react";
import DropZone from "react-dropzone";
import styles from "./Upload.module.css";

import { uploadFile } from "./utils/fileUpload";
import add from "../../assets/icons/add.svg";

export type Props = {
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onUploadError?: (err: any) => void;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  userInstruction: string;
  supportedExtensions: Array<string>;
  disabled: boolean;
  filenameRegex?: RegExp;
};

export default ({
  userInstruction,
  onUploadStart,
  onUploadEnd,
  onUploadError,
  onUploadProgress,
  supportedExtensions,
  filenameRegex,
  disabled,
}: Props) => {
  const handleFileUpload = async (file: File) => {
    try {
      if (file && filenameRegex && !filenameRegex.test(file.name)) {
        throw Error("Invalid filename");
      }
      await uploadFile(
        file,
        supportedExtensions,
        onUploadStart,
        onUploadEnd,
        onUploadProgress
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onUploadError && onUploadError(message);
      return;
    }
  };

  const onDrop = async (files: Array<File>) => {
    await handleFileUpload(files[0]);
  };

  return (
    <DropZone disabled={disabled} onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <div
          data-testid="dropzone-input-wrapper"
          className={styles.dropzone}
          {...getRootProps()}
        >
          <input
            className={styles.dropzoneInput}
            data-testid="dropzone-input"
            disabled={disabled}
            {...getInputProps()}
          />
          <img src={add} alt="add" className={styles.addIcon} />
          <p data-testid="dropzone-instruction" className={styles.instruction}>{userInstruction}</p>
        </div>
      )}
    </DropZone>
  );
};
