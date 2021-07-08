import Layout from "../../components/layout/Layout";
import TermsAndConditions from "../../components/termsAndConditions/TermsAndConditions";

import termsScreen from "../../assets/images/terms-and-conditions-screen.png";
import styles from "./TermsPage.module.css";

export type Props = {
  acceptTerms: () => void;
  onBackClick: () => void;
  onSkipClick: () => void;
  alwaysAllowSkip: boolean;
};

export default ({
  acceptTerms,
  onBackClick,
  onSkipClick,
  alwaysAllowSkip
}: Props) => {
  return (
    <Layout
      banner={{
        src: termsScreen,
        alt: "terms-screen-banner"
      }}
      prompt={
        <>
          OK, here are our <span className="green">terms & conditions</span> -
          you'll need to agree to them
        </>
      }
      nextButton={{
        onClick: acceptTerms,
        label: "Agree"
      }}
      backButton={{ onClick: onBackClick }}
      skipButton={{ onClick: onSkipClick }}
      showSkip={alwaysAllowSkip}
      className={styles.root}
    >
      <div className={styles.termsContainer}>
        <TermsAndConditions />
      </div>
    </Layout>
  );
};
