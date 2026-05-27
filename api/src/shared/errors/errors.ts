import { ApiError } from './ApiError';

export const NotFoundError = (resource: string) =>
  new ApiError(404, `${resource} not found`);

export const ConflictError = (message: string) =>
  new ApiError(409, message);

export const BadRequestError = (message: string) =>
  new ApiError(400, message);

export const UnprocessableError = (message: string) =>
  new ApiError(422, message);

export const InternalError = (message = 'Internal server error') =>
  new ApiError(500, message, false);
