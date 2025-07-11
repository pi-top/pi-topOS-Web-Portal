import React from "react";
import { render, screen } from "@testing-library/react";
import { RoverControllerLink } from "../RoverControllerLanding";

const mockHostname = "pi-top.local";

// Store original window.location
const originalLocation = window.location;

describe("RoverControllerLink", () => {
  beforeAll(() => {
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: mockHostname,
    } as Location;
  });

  afterAll(() => {
    // Restore original location
    window.location = originalLocation;
  });

  it("renders link with correct href", () => {
    render(<RoverControllerLink />);

    const link = screen.getByText("Open Rover Controller");
    expect(link).toHaveAttribute("href", `http://${mockHostname}:8070`);
  });

  it("renders link with target and rel attributes when not standalone", () => {
    render(<RoverControllerLink />);

    const link = screen.getByText("Open Rover Controller");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders link without target and rel attributes when standalone", () => {
    render(<RoverControllerLink standalone />);

    const link = screen.getByText("Open Rover Controller");
    expect(link).toHaveAttribute("href", `http://${mockHostname}:8070`);
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});
