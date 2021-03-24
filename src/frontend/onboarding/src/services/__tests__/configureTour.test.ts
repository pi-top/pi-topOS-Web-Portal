import axios from 'axios'

import configureTour from '../configureTour';

jest.mock('axios');

describe('configureTour', () => {
  it('posts to route correctly', async () => {
    await configureTour()

    expect(axios.post).toHaveBeenCalledWith('/configure-tour', {});
  })
});
