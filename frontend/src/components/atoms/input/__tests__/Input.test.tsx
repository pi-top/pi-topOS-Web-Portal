import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Input, { Props } from '../Input';

const defaultProps: Props = {
  id: 'test-id',
  onChange: () => {},
  value: 'dummy text',
  label: 'label text',
};

const mount = (props: Partial<Props> = {}) =>
  render(<Input {...defaultProps} {...props} />);

describe('<Input />', () => {
  it('renders input with correct value', () => {
    mount();
    expect(document.querySelector('input')!.value).toEqual('dummy text');
  });

  it('call onChange when value is changed', () => {
    const onChange = jest.fn();
    mount({ onChange });

    fireEvent.change(document.querySelector('input')!, {
      target: { value: 'updated content' },
    });

    expect(onChange).toHaveBeenCalledWith('updated content');
  });

  it('renders helpText if passed', () => {
    mount({ helpText: 'help text' });
    expect(screen.queryByText('help text')).toBeInTheDocument();
  });
});
