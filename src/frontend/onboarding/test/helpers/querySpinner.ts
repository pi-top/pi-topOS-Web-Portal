import { queryByLabelText } from '@testing-library/react';

export default (container: HTMLElement) => queryByLabelText(container, "audio-loading");
