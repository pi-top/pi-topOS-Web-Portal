import { Component, ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props> {
  static getDerivedStateFromError(error: Error) {
    if (error) console.error(error);

    return { hasError: !!error };
  }

  state: State = {
    hasError: false
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return fallback;
    }

    return children;
  }
}
