// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { server } from "../src/msw/server";
import { setConnectedNetwork } from './msw/handlers';

const Adapter = require('enzyme-adapter-react-16');
const { configure } = require('enzyme');

const adapter = new Adapter();
configure({ adapter });

beforeAll(() => {
  server.listen()
});
afterEach(() => {
  setConnectedNetwork(undefined);
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
