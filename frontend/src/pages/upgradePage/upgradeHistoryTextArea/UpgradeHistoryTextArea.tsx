import React, { useState, useEffect } from "react";
import cx from 'classnames';

import TextArea from "../../../components/atoms/textarea/TextArea";

import styles from "./UpgradeHistoryTextArea.module.css";

export type Props = {
  className?: string;
  message: string;
};

export default ({
  className,
  message,
}: Props) => {
  const [msg, setMsg] = useState<string[]>([]);

  useEffect(() => {
    setMsg(m => [...m, message])
  }, [message]);

  return (
    <TextArea
      className={cx(styles.textarea, className)}
      value={msg.join("\n")}
      disabled={true}
      autoScroll={true}
    />
  );
};
