import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';

import Image, { Props } from "../Image";

describe("Image", () => {
  let defaultProps: Props;
  let image: ReactNode;
  beforeEach(() => {
    defaultProps = {
      src: 'fake-src',
      alt: 'fake-image',
    };

    ({ container: image } = render(<Image {...defaultProps} />));
  });

  it('renders correctly', () => {
    expect(image).toMatchSnapshot();
  });
});
