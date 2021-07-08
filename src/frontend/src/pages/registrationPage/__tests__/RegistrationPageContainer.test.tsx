import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  RenderResult,
  wait,
  fireEvent,
  QueryByBoundAttribute,
  GetByBoundAttribute,
} from "@testing-library/react";

import RegistrationPageContainer, { Props } from "../RegistrationPageContainer";
import { ErrorMessage } from "../RegistrationPage";

import setRegistration from "../../../services/setRegistration";

jest.mock("../../../services/setRegistration");

const setRegistrationMock = setRegistration as jest.Mock;

describe("RegistrationPageContainer", () => {
  let defaultProps: Props;
  let registrationPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let queryByDisplayValue: BoundFunction<QueryByBoundAttribute>;
  let queryByLabelText: BoundFunction<QueryByBoundAttribute>;
  let getByText: BoundFunction<GetByText>;
  let getByDisplayValue: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(async () => {
    setRegistrationMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      email: "test@test.com",
      setEmail: jest.fn(),
    };

    ({
      container: registrationPageContainer,
      queryByText,
      queryByDisplayValue,
      queryByLabelText,
      getByText,
      getByDisplayValue,
      rerender,
    } = render(<RegistrationPageContainer {...defaultProps} />));
  });
  afterEach(() => {
    setRegistrationMock.mockRestore();
  });

  it("calls goToNextPage when skip button clicked", () => {
    fireEvent.click(getByText("Skip"));

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });

  it("calls goToPreviousPage when back button clicked", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
  });

  it("renders email input correctly", () => {
    expect(queryByDisplayValue(defaultProps.email)).toBeInTheDocument();
  });

  it("calls setEmail when email input changes", () => {
    fireEvent.change(getByDisplayValue(defaultProps.email), {
      target: { value: "test" },
    });

    expect(defaultProps.setEmail).toHaveBeenCalledWith("test");
  });

  describe("when new email is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        email: "new-test@test.com",
      };

      rerender(<RegistrationPageContainer {...defaultProps} />);
    });

    it("renders email input correctly", () => {
      expect(queryByDisplayValue(defaultProps.email)).toBeInTheDocument();
    });
  });

  describe("when next is clicked", () => {
    it("disables 'is over age' checkbox", async () => {
      fireEvent.submit(
        registrationPageContainer.querySelector("#registration-form")!
      );

      expect(queryByLabelText("I am over 13 years old")).toBeDisabled();

      await wait();
    });

    it("disables email input", async () => {
      fireEvent.submit(
        registrationPageContainer.querySelector("#registration-form")!
      );

      expect(queryByDisplayValue(defaultProps.email)).toBeDisabled();

      await wait();
    });

    it("disables the next button", async () => {
      fireEvent.submit(
        registrationPageContainer.querySelector("#registration-form")!
      );

      expect(getByText("Next")).toBeDisabled();

      await wait();
    });

    it('calls setRegistration with email', async () => {
      fireEvent.submit(
        registrationPageContainer.querySelector("#registration-form")!
      );

      expect(setRegistrationMock).toHaveBeenCalledWith(defaultProps.email);

      await wait();
    })

    describe('when setRegistration succeeds', () => {
      beforeEach(async () => {
        fireEvent.submit(
          registrationPageContainer.querySelector("#registration-form")!
        );

        await wait();
      });

      it('calls goToNextPage', () => {
        expect(defaultProps.goToNextPage).toHaveBeenCalled();
      });
    });

    describe('when setRegistration fails', () => {
      beforeEach(async () => {
        setRegistrationMock.mockRejectedValue(new Error('registration failed'))

        fireEvent.submit(
          registrationPageContainer.querySelector("#registration-form")!
        );

        await wait();
      });

      it('renders correct error message', () => {
        expect(queryByText(ErrorMessage.RegistrationError)).toBeInTheDocument();
      })

      it("enables 'is over age' checkbox", async () => {
        expect(queryByLabelText("I am over 13 years old")).not.toBeDisabled();
      });

      it("enables email input", async () => {
        expect(queryByDisplayValue(defaultProps.email)).not.toBeDisabled();
      });

      it("enables the next button", async () => {
        expect(getByText("Next")).not.toBeDisabled();
      });
    });
  });
});
