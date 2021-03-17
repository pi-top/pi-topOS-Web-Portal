import React from 'react';
import { shallow } from 'enzyme';

import Input from '../Input';

describe('<Input />', () => {
  let input;
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      defaultValue: 'Hello World',
      id: 'input',
      onChange: jest.fn(),
    };

    input = shallow(<Input {...defaultProps} />);
  });

  it('renders without crashing', () => {
    expect(input.exists()).toEqual(true);
  });

  it('sets value state property to value prop if passed', () => {
    expect(input.state('value')).toEqual('Hello World');
  });

  it('adds className prop to elements class list', () => {
    input.setProps({ className: 'classy' });

    expect(input.is('.classy')).toEqual(true);
  });

  describe('handleChange method', () => {
    const ev = {
      target: {
        value: 'New Value!',
      },
    };

    it('is called on input change', () => {
      const handleChange = jest.fn();
      input.instance().handleChange = handleChange;
      input.setProps({ defaultValue: 'Force an update' });

      input.find('input').simulate('change', ev);

      expect(handleChange).toHaveBeenCalledWith(ev);
    });

    it('updates the value state property', () => {
      input.instance().handleChange(ev);

      expect(input.state('value')).toEqual(ev.target.value);
    });

    it('calls onChange prop with new value', () => {
      input.instance().handleChange(ev);

      expect(defaultProps.onChange).toHaveBeenCalledWith(ev.target.value);
    });

    it('renders label correctly when passed', () => {
      input.setProps({ label: 'Hello World' });

      expect(input.find('label')).toMatchSnapshot();
    });
  });

  describe('helpText', () => {
    it('renders help text correctly when passed', () => {
      input.setProps({ helpText: 'Help text string' });

      expect(input.find('.helpText')).toMatchSnapshot();
    });
  });
});
