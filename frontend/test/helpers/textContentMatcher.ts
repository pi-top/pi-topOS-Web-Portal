/*
When a message is split across multiple elements it is not possible to query for
the full text without multiple queries using byText etc.

Wrap the message with `textContentMatcher` when passing to RTL queries to check
the `textContent` of elements which combines child text nodes when being
calculated.

Modified from solutions posted in this issue: https://github.com/testing-library/dom-testing-library/issues/410
*/
export default function textContentMatcher(text: string | RegExp) {
  return function (_: any, node: HTMLElement) {
    const hasText = (el: Element) =>
      el.textContent && text instanceof RegExp
        ? text.test(el.textContent)
        : el.textContent === text;

    // fall through to children if they match
    if (Array.from(node?.children || []).some(hasText)) {
      return false;
    }

    return hasText(node);
  };
}
