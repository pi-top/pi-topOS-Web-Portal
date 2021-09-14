import React, { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";

import BuildInformation, { Props } from "../BuildInformation";

describe("BuildInformation", () => {
  let defaultProps: Props;
  let buildInformation: ReactNode;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {};

    ({ container: buildInformation, rerender } = render(
      <BuildInformation {...defaultProps} />
    ));
  });

  it("does not render by default", () => {
    expect(buildInformation).toMatchInlineSnapshot("<div />");
  });

  describe("when build info exists", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        info: {
          'buildRepo': 'experimental-pkgcld',
          'buildDate': '2021-08-09',
          'buildNumber': '100',
          'buildCommit': '07706af4337c60f4007ef9910c33c6e4daab1646',
        },
      };

      rerender(<BuildInformation {...defaultProps} />);
    });

    it("renders correctly", () => {
      expect(buildInformation).toMatchSnapshot();
    });

  });
});
