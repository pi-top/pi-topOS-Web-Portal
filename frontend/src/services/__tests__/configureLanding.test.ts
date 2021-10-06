import axios from 'axios'

import configureLanding from '../configureLanding';

jest.mock('axios');

describe('configureLanding', () => {
  it('posts to route correctly', async () => {
    await configureLanding()

    expect(axios.post).toHaveBeenCalledWith('/configure-landing', {});
  })
});
