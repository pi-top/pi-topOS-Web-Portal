import axios from 'axios'

import deprioritiseOpenboxSession from '../deprioritiseOpenboxSession';

jest.mock('axios');

describe('deprioritiseOpenboxSession', () => {
  it('posts to route correctly', async () => {
    await deprioritiseOpenboxSession()

    expect(axios.post).toHaveBeenCalledWith('/deprioritise-openbox-session', {});
  })
});
