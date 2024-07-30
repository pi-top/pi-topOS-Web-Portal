import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function postFile(
  data: FormData,
  onUploadProgress: (progressEvent: ProgressEvent) => void = (_) => {}
) {
  await axios.post(
    `${apiBaseUrl}/upload-file`,
    data,
    {
      onUploadProgress,
      headers: {
        "Content-Type": "multipart/form-data;",
      },
    }
  );
}
