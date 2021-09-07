import React from "react";

import UpgradeHistoryTextArea from "./UpgradeHistoryTextArea";

export type Props = {
  className: string;
  message: string;
};

export default ( props: Props) => {
  return (
    <UpgradeHistoryTextArea
      {...props}
    />
  );
};
