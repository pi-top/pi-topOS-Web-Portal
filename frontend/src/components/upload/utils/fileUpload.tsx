import fileType from "file-type";

import postFile from "../../../services/postFile";

const MAX_UPLOAD_FILE_SIZE = 2000000000;

export class UploadError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

const getExtension = async (file: File): Promise<string | undefined> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result;
      !arrayBuffer && reject();

      const type = await fileType.fromBuffer(arrayBuffer as ArrayBuffer);
      const extension = type ? type.ext : file.name.split(".").pop();
      resolve(extension);
    };
  });

const fileBody = (file: File): FormData => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  return formData;
};

export const uploadFile = async (
  file: File,
  supportedExtensions?: Array<string>,
  onStart?: () => void,
  onFinish?: () => void,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
) => {
  if (!file) {
    throw new UploadError("No file provided", "NO_FILE_PROVIDED");
  }
  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    throw new UploadError(
      "Maximum upload file size exceeded",
      "MAX_SIZE_EXCEEDED"
    );
  }

  const extension = await getExtension(file);
  if (
    !extension ||
    (supportedExtensions &&
      supportedExtensions.length > 0 &&
      !supportedExtensions.includes(extension))
  ) {
    throw new UploadError("Invalid extension", "INVALID_FILE_TYPE");
  }

  onStart && onStart();
  await postFile(fileBody(file), onUploadProgress);
  onFinish && onFinish();
};
