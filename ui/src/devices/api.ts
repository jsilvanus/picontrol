// Calls to the pimatrix API for the devices page. Reuses the multiview client,
// which already sends the shared Bearer token and throws ApiError on non-2xx.
export { PiMatrixApi, ApiError } from "../multiview/api";
