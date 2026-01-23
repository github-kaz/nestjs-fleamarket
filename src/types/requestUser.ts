import { UserStatus } from '@prisma/client';

export type RequestUser = {
  id: string;
  name: string;
  status: UserStatus;
};
