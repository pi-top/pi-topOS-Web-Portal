import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  wait,
} from "@testing-library/react";


import getVncDesktopUrl from "../../../services/getVncDesktopUrl";
jest.mock("../../../services/getVncDesktopUrl");
const getVncDesktopUrlMock = getVncDesktopUrl as jest.Mock;

import DesktopPageContainer from "../DesktopPageContainer";

describe("DesktopPageContainer", () => {
  it("tries to retrieve the novnc url on mount", () => {
    render(<DesktopPageContainer />);
    expect(getVncDesktopUrlMock).toHaveBeenCalled();
  });
});
