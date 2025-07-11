/**
 * Extracts a list of error messages from an error object returned from an API call.
 * Checks if the error object contains a fieldErrors property, and if so, extracts all the error messages from the field errors.
 * If the error object does not contain a fieldErrors property, it returns the error message from the error object.
 * @param errorObject an object containing an error response from an API call.
 * @returns a list of error messages.
 */
export function extractErrorMessagesFromResponse(errorObject) {
  const fieldErrors = errorObject?.responseBody?.error?.fieldErrors;

  if (!fieldErrors) {
    return [errorObject?.responseBody?.error?.message ?? errorObject?.message];
  }

  return Object.values(fieldErrors).flatMap((errors: Array<Error>) => errors.map((error) => error.message));
}
