import React from "react";

import TermsPage from "./TermsPage";

export type Props = {
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isCompleted: boolean;
};

export default ({ goToNextPage, goToPreviousPage, isCompleted }: Props) => (
  <TermsPage
    onBackClick={goToPreviousPage}
    acceptTerms={goToNextPage}
    onSkipClick={goToNextPage}
    alwaysAllowSkip={isCompleted}
  />
);
