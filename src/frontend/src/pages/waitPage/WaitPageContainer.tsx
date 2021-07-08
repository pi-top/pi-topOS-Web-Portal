import { useState, useEffect } from "react";

import WaitPage from "./WaitPage";

import isFileSystemExpanded from "../../services/isFileSystemExpanded";
import reboot from "../../services/reboot";
import expandFileSystem from "../../services/expandFileSystem";
import enableMouseCursor from "../../services/enableMouseCursor";
import enablePtSysOled from "../../services/enablePtSysOled";

export type Props = {
  goToNextPage: () => void;
};

export default ({
  goToNextPage,
}: Props) => {
  const [isFsExpanded, setIsFsExpanded] = useState(false);
  const [isCheckingFsStatus, setIsCheckingFsStatus] = useState(false);
  const [isExpandingFs, setIsExpandingFs] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [error, setError] = useState(false);

  const fileSystemExpansionStatus = () => {
    setError(false);
    setIsCheckingFsStatus(true);

    isFileSystemExpanded()
      .then((isFileSystemExpandedResponse) => {
          setIsFsExpanded(isFileSystemExpandedResponse.expanded);
          if (isFileSystemExpandedResponse.expanded === false) {
              expandFsAndReboot();
          }
        })
      .catch(() => {
            setIsFsExpanded(false);
            setError(true);
        })
        .finally(() => setIsCheckingFsStatus(false))
  };

  const expandFsAndReboot = () => {
    setIsExpandingFs(true);
    expandFileSystem()
        .then(() => {
            return enableMouseCursor()
        })
        .then(() => {
            return enablePtSysOled()
        })
        .then(() => {
            setIsRebooting(true);
            return reboot()
        })
        .catch(() => setError(true))
  };

  useEffect(() => {
    Promise.all([fileSystemExpansionStatus()]);
  }, []);

  useEffect(() => {
    if (isFsExpanded) {
        goToNextPage();
    };
  }, [isFsExpanded, goToNextPage])

  return (
    <WaitPage
        hasError={error}
        isCheckingFsStatus={isCheckingFsStatus}
        isExpandingFs={isExpandingFs}
        isRebooting={isRebooting}
    />
    );
};
