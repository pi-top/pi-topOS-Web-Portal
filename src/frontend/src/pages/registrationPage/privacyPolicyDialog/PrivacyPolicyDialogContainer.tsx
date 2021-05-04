import React from "react";

import PrivacyPolicyDialog from "./PrivacyPolicyDialog";

export type Props = {
  active: boolean;
  onClose: () => void;
};

export default ( props: Props) => {
  return (
    <PrivacyPolicyDialog
      {...props}
    />
  );
};
