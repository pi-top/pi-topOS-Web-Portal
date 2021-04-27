// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

const Adapter = require('enzyme-adapter-react-16');
const { configure } = require('enzyme');

const adapter = new Adapter();
configure({ adapter });
