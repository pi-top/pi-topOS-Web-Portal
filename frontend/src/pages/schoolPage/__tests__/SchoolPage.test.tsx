import React from "react";
import {
  act,
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  QueryByBoundAttribute,
  GetByText,
  waitForElement,
  getByTestId,
  wait,
} from "@testing-library/react";

import SchoolPage from "../SchoolPage";

import postFile from "../../../services/postFile";
jest.mock("../../../services/postFile");
const postFileMock = postFile as jest.Mock;

const createFile = (filename: string, size: number, type: string) => {
  const file = new File([""], filename, { type });
  Object.defineProperty(file, "size", {
    get() {
      return size;
    },
  });
  return file;
};

describe("SchoolPage", () => {
  let container: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;

  beforeEach(() => {
    postFileMock.mockRestore();
    ({ container, getByAltText, queryByText, getByText, queryByTestId } =
      render(<SchoolPage />));
  });

  it("renders correct image", () => {
    expect(getByAltText("school-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = container.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    expect(queryByTestId("layout-explanation")).toMatchSnapshot();
  });

  it("doesn't render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("doesn't render back button", () => {
    expect(queryByText("Back")).not.toBeInTheDocument();
  });

  it("doesn't render Yes button", () => {
    expect(queryByText("Yes")).not.toBeInTheDocument();
  });

  it("doesn't render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("renders a drop-zone to upload files", () => {
    expect(queryByTestId("dropzone-input-wrapper")).toMatchSnapshot();
  });

  it("displays an error message if user tries to upload a file with the wrong name or extension", async () => {
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [createFile("pi-top-usb-setup.tar", 1234, "application/tar")],
        },
      });
    });
    await waitForElement(() => queryByTestId("error-message"));
    expect(queryByTestId("error-message")).toMatchSnapshot();
  });

  it("displays an error message if user tries to upload a large file", async () => {
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile(
              "pi-top-usb-setup.tar.gz",
              2000000001,
              "application/tar"
            ),
          ],
        },
      });
    });
    await waitForElement(() => queryByTestId("error-message"));
    expect(queryByTestId("error-message")).toMatchSnapshot();
  });

  it("displays a progress bar while the file is being transfered", async () => {
    postFileMock.mockImplementation(
      (
        data: FormData,
        onUploadProgress: (progressEvent: ProgressEvent) => void = (_) => {}
      ) => {
        return new Promise(() => {
          onUploadProgress({ loaded: 10, total: 100 });
        });
      }
    );
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("pi-top-usb-setup.tar.gz", 100, "application/tar"),
          ],
        },
      });
    });

    await waitForElement(() => queryByTestId("progress"));
    // dropzone isn't rendered anymore
    expect(container.querySelector("input")).not.toBeInTheDocument();
    // progress bar is rendered
    expect(queryByTestId("progress")).toMatchSnapshot();
  });

  it("displays a message when the transfer finishes", async () => {
    postFileMock.mockImplementation(
      (
        data: FormData,
        onUploadProgress: (progressEvent: ProgressEvent) => void = (_) => {}
      ) => {
        return new Promise((resolve) => {
          onUploadProgress({ loaded: 100, total: 100 });
          resolve("OK")
        });
      }
    );

    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("pi-top-usb-setup.tar.gz", 100, "application/tar"),
          ],
        },
      });
    });

    await wait();
    await wait();
    // explanation message is updated
    expect(queryByTestId("layout-explanation")).toMatchSnapshot();
  });
});
