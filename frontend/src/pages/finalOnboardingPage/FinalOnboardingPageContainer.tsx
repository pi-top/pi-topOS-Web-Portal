import React from "react";

import FinalOnboardingPage from "./FinalOnboardingPage";

export type Props = {
  goToPreviousPage?: () => void;
  goToNextPage?: () => void;
};

export default ({ goToPreviousPage, goToNextPage }: Props) => {
  return (
    <FinalOnboardingPage
      onBackClick={goToPreviousPage}
      onNextClick={goToNextPage}
    />
  );
};
