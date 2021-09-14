
export const runningOnWebRenderer: () => boolean = () => {
  return window.navigator.userAgent === "web-renderer";
};
