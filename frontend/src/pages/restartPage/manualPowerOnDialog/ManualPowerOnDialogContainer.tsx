import React from "react";

import ManualPowerOnDialog from "./ManualPowerOnDialog";

export type Props = {
  active: boolean;
  onClose: () => void;
};

export default ( props: Props) => {
  return (
    <ManualPowerOnDialog
      {...props}
    />
  );
};
