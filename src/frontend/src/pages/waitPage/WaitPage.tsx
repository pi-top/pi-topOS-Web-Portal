import styles from "./WaitPage.module.css";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

export type Props = {
  hasError: boolean,
  isCheckingFsStatus: boolean,
  isExpandingFs: boolean,
  isRebooting: boolean
};

export enum ExplanationMessage {
  CheckingFsStatus = "",
  ExpandingFs = "Expanding file system",
  Rebooting = "Rebooting",
  Default = ""
}

export enum ErrorMessage {
  GenericError = "There was an issue, please turn your device off and back on.",
}

export default ({ isCheckingFsStatus, isExpandingFs, isRebooting, hasError }: Props) => {
  const errorMessage = hasError && ErrorMessage.GenericError;
  const getExplanation = () => {
    if (isRebooting) {
      return ExplanationMessage.Rebooting;
    }
    if (isExpandingFs) {
      return ExplanationMessage.ExpandingFs;
    }
    if (isCheckingFsStatus) {
      return ExplanationMessage.CheckingFsStatus;
    }
    return ExplanationMessage.Default;
  }
  return (
    <Layout
      banner={{
        src: "",
        alt: "wait-screen"
      }}
      prompt={
        (isExpandingFs || isRebooting) && <>
          <Spinner size={50} />
        </>
      }
      explanation={getExplanation()}
      nextButton={{
        onClick: () => {},
        label: '',
        hidden: true
      }}
      className={styles.root}
    >
      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
