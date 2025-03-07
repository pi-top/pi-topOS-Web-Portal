import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  RenderResult,
  QueryByBoundAttribute,
  within,
} from "@testing-library/react";

import RegistrationPage, { Props, ErrorMessage, explanation } from "../RegistrationPage";

describe("RegistrationPage", () => {
  let defaultProps: Props;
  let registrationPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let queryByPlaceholderText: BoundFunction<QueryByBoundAttribute>;
  let queryByDisplayValue: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let getByPlaceholderText: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      register: jest.fn(),
      isRegistering: false,
      registrationError: false,
      skip: jest.fn(),
      back: jest.fn(),
      email: "",
      setEmail: jest.fn(),
    };

    ({
      container: registrationPage,
      getByAltText,
      queryByText,
      queryByTestId,
      queryByPlaceholderText,
      queryByDisplayValue,
      queryByLabelText,
      getByLabelText,
      getByText,
      getByPlaceholderText,
      rerender,
    } = render(<RegistrationPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("registration-screen-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = registrationPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    expect(
      queryByText(explanation)
    ).toBeInTheDocument();
  });

  it("does not render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders next button", () => {
    expect(queryByText("Next")).toBeInTheDocument();
  });

  it("renders skip button", () => {
    expect(queryByText("Skip")).toBeInTheDocument();
  });

  it("renders back button", () => {
    expect(queryByText("Back")).toBeInTheDocument();
  });

  it("does not call skip or register when next button clicked", () => {
    fireEvent.click(getByText("Next"));

    expect(defaultProps.skip).not.toHaveBeenCalled();
    expect(defaultProps.register).not.toHaveBeenCalled();
  });

  it("calls skip when skip button clicked", () => {
    fireEvent.click(getByText("Skip"));

    expect(defaultProps.skip).toHaveBeenCalled();
  });

  it("calls back when back button clicked", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.back).toHaveBeenCalled();
  });

  it("renders 'is over age' checkbox", () => {
    expect(queryByText("I am over 13 years old")).toBeInTheDocument();
  });

  it("checks the 'is over age' checkbox", () => {
    expect(queryByLabelText("I am over 13 years old")).toBeChecked();
  });

  it("renders email input", () => {
    expect(
      queryByPlaceholderText("Please enter your email...")
    ).toBeInTheDocument();
  });

  it('calls setEmail on email input change', () => {
    fireEvent.change(getByPlaceholderText('Please enter your email...'), { target: { value: 'test' } });

    expect(defaultProps.setEmail).toHaveBeenCalledWith('test');
  })

  it("renders the privacy policy dialog", () => {
    expect(queryByTestId("privacy-policy-dialog")).toBeInTheDocument();
  });

  it("hides the privacy policy dialog", () => {
    expect(queryByTestId("privacy-policy-dialog")).toHaveClass("hidden");
  });

  describe("when clicking over privacy policy", () => {
    beforeEach(() => {
      fireEvent.click(getByText("Privacy Policy"));
    });

    it("shows the privacy policy dialog", () => {
      expect(queryByTestId("privacy-policy-dialog")).not.toHaveClass("hidden");
    });

    it("renders dialog message correctly", () => {
      expect(within(queryByTestId("privacy-policy-dialog")!).queryByTestId("dialog-message")).toMatchSnapshot();
    });

    it("hides the dialog on Close click", () => {
      fireEvent.click(within(queryByTestId("privacy-policy-dialog")!).getByText("Close"));
      expect(queryByTestId("privacy-policy-dialog")).toHaveClass("hidden");
    });
  });

  describe("when isRegistering is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isRegistering: true,
      };

      rerender(<RegistrationPage {...defaultProps} />);
    });

    it("disables 'is over age' checkbox", () => {
      expect(queryByLabelText("I am over 13 years old")).toBeDisabled();
    });

    it("disables email input", () => {
      expect(
        queryByPlaceholderText("Please enter your email...")
      ).toBeDisabled();
    });

    it("disables the next button", () => {
      expect(getByText("Next").parentElement).toBeDisabled();
    });
  });

  describe("when registrationError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        registrationError: true,
      };

      rerender(<RegistrationPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.RegistrationError)).toBeInTheDocument();
    });
  });

  describe("when email is not an empty string", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        email: "test@test.com",
      };

      rerender(<RegistrationPage {...defaultProps} />);
    });

    it("renders email input with email as value", async () => {
      expect(queryByDisplayValue(defaultProps.email)).toBeInTheDocument();
    });

    // ideal test below is not possible without using jest-environment-jsdom-fourteen package
    it.skip("calls register on next button click", async () => {
      fireEvent.click(getByText("Next"));

      expect(defaultProps.register).toHaveBeenCalledWith(defaultProps.email);
    });

    it('calls register on form submit', () => {
      fireEvent.submit(registrationPage.querySelector('#registration-form')!);

      expect(defaultProps.register).toHaveBeenCalledWith(defaultProps.email);
    })
  });

  describe("when 'is over age' checkbox is clicked", () => {
    beforeEach(() => {
      fireEvent.click(getByLabelText("I am over 13 years old"));
    });

    it("unchecks the 'is over age' checkbox", () => {
      expect(queryByLabelText("I am over 13 years old")).not.toBeChecked();
    });

    it("does not render email input", () => {
      expect(
        queryByPlaceholderText("Please enter your email...")
      ).not.toBeInTheDocument();
    });

    it("calls skip when next button clicked", () => {
      fireEvent.click(getByText("Next"));

      expect(defaultProps.skip).toHaveBeenCalled();
    });
  });
});
