/* eslint react-hooks/rules-of-hooks: warn, react-hooks/exhaustive-deps: warn */

import React, { ReactNode, memo, useState } from "react";
import cx from "classnames";

import PrimaryButton, {
  Props as ButtonProps,
} from "../primaryButton/PrimaryButton";
import OptionCard, { OptionProps } from "../optionCard/OptionCard";
import Button from "../atoms/button/Button";
import Header from "../header/Header";
import Spinner from "../atoms/spinner/Spinner";

import styles from "./Choice.module.css";

export type ChoiceViewProps = {
  title: ReactNode;
  description?: string;
  options: OptionProps[];
};

type LayoutButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
};

export type Props = ChoiceViewProps & {
  selected?: string;
  onOptionClick?: (value: string) => void;
  backButton?: LayoutButtonProps;
  skipButton?: LayoutButtonProps;
  nextButton: LayoutButtonProps;
  isLoading?: boolean;
  showSkip?: boolean;
  showNext?: boolean;
  showBack?: boolean;
  children?: ReactNode;
};

const Choice = ({
  title,
  description,
  options,
  selected,
  backButton,
  skipButton,
  nextButton,
  isLoading = false,
  showSkip = false,
  showNext = true,
  showBack = false,
  onOptionClick,
  children,
}: Props) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    selected
  );

  const onOptionCardClick = (value: string | undefined) => {
    if (value) {
      setSelectedOption(selectedOption === value ? undefined : value);
      onOptionClick && onOptionClick(value);
    }
  };

  return (
    <section data-testid="choice-root" className={cx(styles.root)}>
      <Header />

      <header className={styles.header}>
        <h1 data-testid="choice-title" className={styles.title}>
          {title}
        </h1>
        <p data-testid="choice-description" className={styles.description}>
          {description}
        </p>
      </header>

      <div data-testid="choice-options" className={styles.options}>
        {options.map((optionProps) => (
          <OptionCard
            {...optionProps}
            key={optionProps.value}
            selected={selectedOption === optionProps.value}
            onClick={(value) => {
              optionProps.onClick && optionProps.onClick(value);
              onOptionCardClick(value);
            }}
            className={styles.card}
          />
        ))}
      </div>

      {children}

      <div className={styles.spacer} />

      <div className={styles.buttons}>
        <div className={styles.backButtonContainer}>
          {backButton && showBack && (
            <Button {...backButton} className={styles.backButton} unstyled>
              {backButton.label ? backButton.label : "Back"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <Spinner size={60} />
        ) : (
          showNext && (
            <PrimaryButton
              {...nextButton}
              disabled={!selectedOption || nextButton?.disabled}
            >
              {nextButton.label ? nextButton.label : "Next"}
            </PrimaryButton>
          )
        )}

        <div className={styles.skipButtonContainer}>
          {skipButton && showSkip && (
            <Button {...skipButton} className={styles.skipButton} unstyled>
              {skipButton.label ? skipButton.label : "Skip"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(Choice);
