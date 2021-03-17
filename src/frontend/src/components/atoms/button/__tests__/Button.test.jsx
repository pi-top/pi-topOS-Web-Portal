import React from 'react';
import { shallow } from 'enzyme';
import Button from '../Button';

describe('<Button />', () => {
  let button;
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      onClick: jest.fn(),
    };

    button = shallow(<Button {...defaultProps}>Hello</Button>);
  });

  it('renders without crashing', () => {
    expect(button.exists()).toEqual(true);
  });

  it('renders correctly', () => {
    expect(button).toMatchSnapshot();
  });

  it('calls onClick when clicked', () => {
    button.simulate('click');

    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('adds styled class by default', () => {
    expect(button.is('.styled')).toEqual(true);
  });

  it('adds className prop to elements class list', () => {
    button.setProps({ className: 'classy' });

    expect(button.is('.classy')).toEqual(true);
  });

  it('adds unstyled class if unstyled prop is passed', () => {
    button.setProps({ unstyled: true });

    expect(button.is('.unstyled')).toEqual(true);
  });

  it('sets correct attributes if type is submit', () => {
    button.setProps({ type: 'submit' });

    expect(button.props().type).toEqual('submit');
  });
});
