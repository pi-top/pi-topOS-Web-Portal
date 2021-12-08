import React from "react";

import MoveAwayFromApDialog from "./MoveAwayFromApDialog";

export type Props = {
  active: boolean;
  piTopIpAddress: string;
  onSkip: () => void;
};

export default ( props: Props) => {
  return (
    <MoveAwayFromApDialog
      {...props}
    />
  );
};
