import { UserStatus } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  username: string;
  status: UserStatus;
};
