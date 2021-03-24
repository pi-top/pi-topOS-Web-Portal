import React, { useState } from "react";

import RegistrationPage from "./RegistrationPage";
import setRegistration from "../../services/setRegistration";

export type Props = {
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  email: string;
  setEmail: (email: string) => void;
};

export default ({ goToNextPage, goToPreviousPage, email, setEmail }: Props) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(false);

  return (
    <RegistrationPage
      register={email => {
        setIsRegistering(true);

        setRegistration(email)
          .then(goToNextPage)
          .catch(() => {
            setRegistrationError(true);
            setIsRegistering(false);
          });
      }}
      isRegistering={isRegistering}
      registrationError={registrationError}
      email={email}
      setEmail={setEmail}
      skip={goToNextPage}
      back={goToPreviousPage}
    />
  );
};
