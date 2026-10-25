// Shared helpers of the composite page (the devices page was folded into the main UI). Calls to the pimatrix API. Reuses the multiview client,
// which already sends the shared Bearer token and throws ApiError on non-2xx.
export { PiMatrixApi, ApiError } from "../multiview/api";
