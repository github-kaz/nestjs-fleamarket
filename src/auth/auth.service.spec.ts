import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User, UserStatus } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

// bcryptのモック
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('正常系', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test-user',
        email: 'test@example.com',
        password: 'Test1234!',
        status: UserStatus.FREE,
      };

      const hashedPassword = 'hashed-password';
      const expectedUser: User = {
        id: 'test-id1',
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        status: createUserDto.status,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await authService.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
          status: createUserDto.status,
        },
      });
    });
  });

  describe('signIn', () => {
    it('正常系', async () => {
      const credentialsDto: CredentialsDto = {
        email: 'test@example.com',
        password: 'Test1234!',
      };

      const user: User = {
        id: 'test-id1',
        name: 'test-user',
        email: credentialsDto.email,
        password: 'hashed-password',
        status: UserStatus.FREE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const accessToken = 'test-access-token';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(accessToken);

      const result = await authService.signIn(credentialsDto);

      expect(result).toEqual({ accessToken });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentialsDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentialsDto.password,
        user.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        username: user.name,
        status: user.status,
      });
    });

    it('異常系: ユーザーが存在しない', async () => {
      const credentialsDto: CredentialsDto = {
        email: 'test@example.com',
        password: 'Test1234!',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.signIn(credentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('異常系: パスワードが間違っている', async () => {
      const credentialsDto: CredentialsDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const user: User = {
        id: 'test-id1',
        name: 'test-user',
        email: credentialsDto.email,
        password: 'hashed-password',
        status: UserStatus.FREE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(credentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentialsDto.password,
        user.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
