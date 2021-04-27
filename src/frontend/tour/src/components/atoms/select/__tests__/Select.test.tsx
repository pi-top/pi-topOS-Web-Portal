import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';

import Select, { Props } from "../Select";

describe("Select", () => {
  let defaultProps: Props;
  let select: ReactNode;
  beforeEach(() => {
    defaultProps = {
      onChange: jest.fn(),
    };

    ({ container: select } = render(<Select {...defaultProps} />));
  });

  it('renders correctly', () => {
    expect(select).toMatchSnapshot();
  });
});
