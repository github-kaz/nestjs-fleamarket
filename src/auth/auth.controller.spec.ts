import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { User, UserStatus } from '@prisma/client';

const mockAuthService = {
  createUser: jest.fn(),
  signIn: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('正常系', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test-user',
        email: 'test@example.com',
        password: 'Test1234!',
        status: UserStatus.FREE,
      };

      const expectedUser: User = {
        id: 'test-id1',
        name: createUserDto.name,
        email: createUserDto.email,
        password: 'hashed-password',
        status: createUserDto.status,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (authService.createUser as jest.Mock).mockResolvedValue(expectedUser);

      const result = await authController.signUp(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn', () => {
    it('正常系', async () => {
      const credentialsDto: CredentialsDto = {
        email: 'test@example.com',
        password: 'Test1234!',
      };

      const expectedResult = { accessToken: 'test-access-token' };

      (authService.signIn as jest.Mock).mockResolvedValue(expectedResult);

      const result = await authController.signIn(credentialsDto);

      expect(result).toEqual(expectedResult);
      expect(authService.signIn).toHaveBeenCalledWith(credentialsDto);
    });
  });
});
