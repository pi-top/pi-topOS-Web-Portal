import { fireEvent, getByText } from '@testing-library/react';
import { KeyCode } from '../types/Keys';

export default (container: HTMLElement, selectedValueLabel: string) =>
  fireEvent.keyDown(
    getByText(container, selectedValueLabel),
    { keyCode: KeyCode.DownArrow }
  );
