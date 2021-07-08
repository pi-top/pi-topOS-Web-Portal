import { ReactNode } from "react";
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
          buildName: "test-build",
          buildNumber: "1234567890",
          buildDate: "2020-01-01T00:00:00.000Z",
          buildRepo: "test-build-repo",
          finalRepo: "final-test-build-repo",
          buildHash: "094cdf6bc25b7429eb2820528f031afe",
        },
      };

      rerender(<BuildInformation {...defaultProps} />);
    });

    it("renders correctly", () => {
      expect(buildInformation).toMatchSnapshot();
    });

    describe('when final repo is "sirius"', () => {
      beforeEach(() => {
        defaultProps = {
          ...defaultProps,
          info: {
            ...defaultProps.info!,
            finalRepo: "sirius",
          },
        };

        rerender(<BuildInformation {...defaultProps} />);
      });

      it("renders correctly", () => {
        expect(buildInformation).toMatchSnapshot();
      });
    });
  });
});
