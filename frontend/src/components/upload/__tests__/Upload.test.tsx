import React from "react";
import {
  act,
  render,
  fireEvent,
  BoundFunction,
  QueryByBoundAttribute,
  wait,
} from "@testing-library/react";

import Upload from "../Upload";
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

describe("Upload", () => {
  let defaultProps: Props;
  let container: HTMLElement;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;

  beforeEach(() => {
    postFileMock.mockResolvedValue("OK");

    defaultProps = {
        onUploadStart: jest.fn(),
        onUploadEnd: jest.fn(),
        onUploadError: jest.fn(),
        onUploadProgress: jest.fn(),
        userInstruction: "this is an instruction",
        supportedExtensions: ["zip"],
        disabled: false,
        filenameRegex: /^valid-filename\.zip$/,
    };

    ({ container, queryByTestId } =
      render(<Upload {...defaultProps} />));
  });

  it("renders provided instruction", () => {
    expect(queryByTestId("dropzone-instruction")).toMatchSnapshot();
  });

  it("renders a drop-zone to upload files", () => {
    expect(queryByTestId("dropzone-input-wrapper")).toMatchSnapshot();
  });

  it("calls onUploadError if user tries to upload a file with the wrong name or extension", async () => {
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [createFile("not-a-zip.zip", 1234, "application/zip")],
        },
      });
    });

    await wait();
    await wait();
    expect(defaultProps.onUploadError).toHaveBeenCalledWith("Invalid filename");
  });

  it("calls onUploadError if user tries to upload a large file", async () => {
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile(
              "valid-filename.zip",
              2000000001,
              "application/zip"
            ),
          ],
        },
      });
    });

    await wait();
    await wait();
    expect(defaultProps.onUploadError).toHaveBeenCalledWith("Maximum upload file size exceeded");
  });

  it("calls onUploadError when upload process fails", async () => {
    postFileMock.mockRejectedValue(new Error("Oh oh"));

    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("valid-filename.zip", 100, "application/zip"),
          ],
        },
      });
    });

    await wait();
    await wait();
    expect(defaultProps.onUploadError).toHaveBeenCalled();
  });

  it("calls onUploadProgress while file is being uploaded", async () => {
    const progressData = { loaded: 10, total: 100 }
    postFileMock.mockImplementation(
      (
        data: FormData,
        onUploadProgress: (progressEvent: ProgressEvent) => void = (_) => {}
      ) => {
        return new Promise(() => {
          onUploadProgress(progressData);
        });
      }
    );
    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("valid-filename.zip", 100, "application/zip"),
          ],
        },
      });
    });

    await wait();
    await wait();
    expect(defaultProps.onUploadProgress).toHaveBeenCalledWith(progressData);

  });

  it("calls onUploadStart when a valid file is provided and upload starts", async () => {
    postFileMock.mockRejectedValue("Oh oh");

    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("valid-filename.zip", 100, "application/zip"),
          ],
        },
      });
    });

    await wait();
    await wait();
    expect(defaultProps.onUploadStart).toHaveBeenCalled();
  });

  it("calls onUploadEnd when upload completes", async () => {
    postFileMock.mockResolvedValue("OK");

    act(() => {
      const dropzone = container.querySelector("input")!;
      fireEvent.change(dropzone, {
        target: {
          files: [
            createFile("valid-filename.zip", 100, "application/zip"),
          ],
        },
      });
    });

    await wait();
    await wait();
    await wait();
    await wait();
    expect(defaultProps.onUploadEnd).toHaveBeenCalled();
  });
});
