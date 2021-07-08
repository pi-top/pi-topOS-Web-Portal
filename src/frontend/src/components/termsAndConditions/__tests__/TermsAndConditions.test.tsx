import { render, QueryByText, BoundFunction } from "@testing-library/react";

import TermsAndConditions from "../TermsAndConditions";

describe("TermsAndConditions", () => {
  let queryByText: BoundFunction<QueryByText>;
  beforeEach(() => {
    ({ queryByText } = render(<TermsAndConditions />));
  });

  it("renders pi-topOS EULA", () => {
    expect(
      queryByText("pi-topOS End User Licence Agreement (EULA)")
    ).toBeInTheDocument();
  });
});
