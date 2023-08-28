import React from "react";

import SchoolPage from "./SchoolPage";

export type Props = {
  goToPreviousPage: () => void;
};

export default ({
  goToPreviousPage,
}: Props) => {
  return <SchoolPage
    onBackButtonClick={goToPreviousPage}
  />
  ;
};
