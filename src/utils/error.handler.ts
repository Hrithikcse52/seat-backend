import { Response } from 'express';

export function handleAPIError(res: Response, error: unknown, code = 500, message = 'something went wrong!') {
  return res.status(code).send({ message, error: JSON.stringify(error) });
}
