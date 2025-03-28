import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CloseButton from "./CloseButton";

describe("CloseButton", () => {
  it("renders without crashing", () => {
    render(<CloseButton />);
    expect(screen.getByLabelText("close-window")).toBeInTheDocument();
  });

  it("calls onClose callback when clicked", () => {
    const mockOnClose = jest.fn();
    render(<CloseButton onClose={mockOnClose} />);

    const button = screen.getByLabelText("close-window");
    fireEvent.click(button);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-class";
    const { container } = render(<CloseButton className={customClass} />);

    const maskedDiv = container.firstChild;
    expect(maskedDiv).toHaveClass(customClass);
  });
});
