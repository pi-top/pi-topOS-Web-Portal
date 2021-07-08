import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  let errorPage: HTMLElement;

  beforeEach(() => {
    ({ container: errorPage } = render(
      <ErrorPage />
    ));
  });

  afterEach(cleanup);

  it('renders correctly', () => {
    expect(errorPage).toMatchSnapshot();
  });
});
