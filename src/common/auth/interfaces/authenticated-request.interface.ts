import { UserType } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  tipo: UserType;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
