export type Keyboard = {
  layout: string;
  variant?: string;
};

export type KeyboardsData = {
  [keyboardCode: string]: string;
};

export type KeyboardVariantsData = {
  [keyboardCode: string]: {
    [variantCode: string]: string;
  };
};
