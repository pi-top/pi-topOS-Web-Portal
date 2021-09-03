import React from "react";

import NewOsVersionDialog from "./NewOsVersionDialog";

export type Props = {
  active: boolean;
  requireBurn: boolean;
  shouldBurn: boolean;
  onClose: () => void;
};

export default ( props: Props) => {
  return (
    <NewOsVersionDialog
      {...props}
    />
  );
};
