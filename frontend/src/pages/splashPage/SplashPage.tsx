import React, { useState } from "react";

import CheckBox from "../../components/atoms/checkBox/CheckBox";

import introScreen from "../../assets/images/intro-screen.png";
import styles from "./SplashPage.module.css";
import Layout from "../../components/layout/Layout";

import triggerReadyToBeAMakerEvent from "../../services/triggerReadyToBeAMakerEvent";
import { UserType } from "../../types/UserType";

export type Props = {
  goToNextPage: (userType: UserType) => void;
};

export default ({ goToNextPage }: Props) => {
  const [isSchoolUser, setIsSchoolUser] = useState(false);

  return (
    <Layout
      banner={{
        src: introScreen,
        alt: "intro-screen",
      }}
      prompt={
        <>
          Are you ready to <span className="green">start</span>?
        </>
      }
      nextButton={{
        onClick: () => {
          triggerReadyToBeAMakerEvent()
            .catch(() => null)
            .then(() =>
              goToNextPage(isSchoolUser ? UserType.School : UserType.Home)
            );
        },
        label: "Yes",
      }}
      className={styles.root}
    >
      <CheckBox
        name="user"
        label="I'm a school"
        checked={isSchoolUser}
        onChange={() => setIsSchoolUser(!isSchoolUser)}
        className={styles.checkbox}
      />
    </Layout>
  );
};
