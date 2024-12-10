import { Response } from 'express';

export const sendResponse = (res: Response, data: any): void => {
  res.json(data);
};
