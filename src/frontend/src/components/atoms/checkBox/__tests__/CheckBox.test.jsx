import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CheckBox from '../CheckBox';

describe('<CheckBox />', () => {
  let defaultProps;
  let getByText;
  let getByLabelText;
  let rerender;
  let checkBox;

  beforeEach(() => {
    defaultProps = {
      onChange: jest.fn(),
      label: 'Label',
      checked: true,
    };

    ({ container: checkBox, getByText, getByLabelText, rerender } = render(
      <CheckBox {...defaultProps} />
    ));
  });

  afterEach(cleanup);

  it('renders correctly', () => {
    expect(getByLabelText(defaultProps.label)).toBeInTheDocument();
  });

  it('checked when matching the checked prop', () => {
    rerender(<CheckBox {...defaultProps} checked />);

    expect(getByLabelText(defaultProps.label).checked).toEqual(true);
  });

  it('calls onChange with item value when click checkbox', () => {
    fireEvent.click(getByLabelText(defaultProps.label));

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("doesn't call onChange when click disabled items", () => {
    rerender(<CheckBox {...defaultProps} disabled />);

    fireEvent.click(getByLabelText(defaultProps.label));

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('show error message when matching errorMessage', () => {
    rerender(<CheckBox {...defaultProps} errorMessage="error messages" />);

    expect(getByText('error messages')).toBeInTheDocument();
  });

  it('show label text in left side when matching textLeft', () => {
    rerender(<CheckBox {...defaultProps} textLeft />);

    expect(checkBox).toMatchSnapshot();
  });

  it('display inline when matching inline', () => {
    rerender(<CheckBox {...defaultProps} inline />);

    expect(checkBox).toMatchSnapshot();
  });
});
