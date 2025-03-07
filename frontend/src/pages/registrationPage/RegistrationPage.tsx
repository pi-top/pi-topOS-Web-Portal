import React, { useState, useRef } from "react";
import cx from "classnames";

import Layout from "../../components/layout/Layout";
import Input from "../../components/atoms/input/Input";
import CheckBox from "../../components/atoms/checkBox/CheckBox";
import Button, { Props as ButtonProps } from "../../components/atoms/button/Button";

import registrationScreen from "../../assets/images/registration-screen.png";
import styles from "./RegistrationPage.module.css";
import PrivacyPolicyDialogContainer from "./privacyPolicyDialog/PrivacyPolicyDialogContainer";
import TermsDialog from "./termsDialog/TermsDialog";

export enum ErrorMessage {
  RegistrationError = "There was a problem registering your device - please skip (we can help you register your device later)"
}

export const explanation = "We occasionally send blog posts and product updates."

export type Props = {
  register: (email: string) => void;
  isRegistering: boolean;
  registrationError: boolean;
  skip: () => void;
  back: () => void;
  email: string;
  setEmail: (email: string) => void;
};

export default ({
  register,
  isRegistering,
  registrationError,
  skip,
  back,
  email,
  setEmail,
}: Props) => {
  const [isOverAge, setIsOverAge] = useState(true);
  const [isPrivacyPolicyDialogActive, setIsPrivacyPolicyDialogActive] = useState(false);
  const [isTermsDialogActive, setIsTermsDialogActive] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  let nextButtonProps: Partial<ButtonProps> = {
    disabled: isRegistering,
    type: "submit",
    form: "registration-form"
  };

  if (!isOverAge) {
    nextButtonProps = {
      onClick: skip
    };
  }

  let errorMessage = "";
  if (registrationError) {
    errorMessage = ErrorMessage.RegistrationError;
  }

  return (
    <Layout
      banner={{
        src: registrationScreen,
        alt: "registration-screen-banner"
      }}
      prompt={
        <>
          Please, {" "}
          <span className="green">register</span>
          {" "}
          your device.
        </>
      }
      explanation={explanation}
      nextButton={nextButtonProps}
      backButton={{ onClick: back }}
      skipButton={{ onClick: skip }}
      className={styles.root}
    >
      <form
        ref={formRef}
        id="registration-form"
        onSubmit={event => {
          event.preventDefault();

          register(email);
        }}
      />

      <CheckBox
        name="age"
        label="I am over 13 years old"
        checked={isOverAge}
        onChange={() => setIsOverAge(!isOverAge)}
        disabled={isRegistering}
        className={styles.checkbox}
      />

      {isOverAge && (
        <Input
          id="registration-page-email"
          form="registration-form"
          type="email"
          value={email}
          onChange={newEmail => setEmail(newEmail)}
          placeholder="Please enter your email..."
          disabled={isRegistering}
          className={cx(styles.input, { [styles.visible]: isOverAge })}
          required
        />
      )}

      <span className={styles.message}>
        See our <Button className={styles.privacyPolicyButton} unstyled onClick= {() => setIsPrivacyPolicyDialogActive(true)}>Privacy Policy</Button> for more information
      </span>

      <span className={styles.message}>
        By using pi-topOS, you are agreeing to our <Button className={styles.privacyPolicyButton} unstyled onClick= {() => setIsTermsDialogActive(true)}>Terms & Conditions</Button>.
      </span>


      {errorMessage && <span className={styles.error}>{errorMessage}</span>}

      <PrivacyPolicyDialogContainer
        active={isPrivacyPolicyDialogActive}
        onClose={() => setIsPrivacyPolicyDialogActive(false)}
      />

      <TermsDialog
        active={isTermsDialogActive}
        onClose={() => setIsTermsDialogActive(false)}
      />
    </Layout>
  );
};
