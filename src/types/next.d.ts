import type { File } from 'multer';
import type { NextApiRequest } from 'next';

export interface NextApiRequestWithFile extends NextApiRequest {
  file: File;
}
