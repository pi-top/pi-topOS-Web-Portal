import React, { useCallback, useEffect, useState } from "react";

import Choice from "../../components/choice/Choice";
import { OptionProps } from "../../components/optionCard/OptionCard";
import { UserType } from "../../types/UserType";
import home from "../../assets/images/home.jpg";
import teacher from "../../assets/images/teacher.jpg";
import triggerReadyToBeAMakerEvent from "../../services/triggerReadyToBeAMakerEvent";
import { runningOnWebRenderer } from "../../helpers/utils";
import isConnectedToNetwork from "../../services/isConnectedToNetwork";

export type Props = {
  goToNextPage: (userType: UserType) => void;
};

const schoolUserOptionProps: OptionProps = {
  label: "Teacher",
  value: "SCHOOL",
  thumbnail: teacher,
  selected: true,
};

const homeUserOptionProps: OptionProps = {
  label: "Home",
  value: "HOME",
  thumbnail: home,
  selected: false,
};

export default ({ goToNextPage }: Props) => {
  const [userType, setUserType] = useState<UserType | undefined>(undefined);
  const [connectedToInternet, setConnectedToInternet] = useState<boolean | undefined>(undefined);

  const onNextButtonClick = useCallback(
    (userType: UserType) => {
      triggerReadyToBeAMakerEvent()
      .catch(() => null)
      .then(() => goToNextPage(userType))
    },
    [goToNextPage]
  );

  useEffect(() => {
    try {
      isConnectedToNetwork()
        .then((isConnectedToNetworkResponse) => setConnectedToInternet(isConnectedToNetworkResponse.connected))
    } catch {
      setConnectedToInternet(false);
    }
  }, []);

  // If offline or onboarding in device, skip this page
  useEffect(() => {
    if (runningOnWebRenderer() || connectedToInternet === false) {
      onNextButtonClick(UserType.HOME);
    }
  }, [connectedToInternet, onNextButtonClick]);

  return (
    <Choice
      title={
        <>
          Welcome! What type of <span className="green">user</span> are you?
        </>
      }
      options={[schoolUserOptionProps, homeUserOptionProps]}
      onOptionClick={(value) => {
        setUserType(value as UserType);
      }}
      nextButton={{
        onClick: () => {
          userType && onNextButtonClick(userType);
        },
        label: "Next",
      }}
      showSkip={false}
      showNext={true}
      showBack={false}
    />
  );
};
