import { Test } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Item, ItemStatus } from '@prisma/client';
import { RequestUser } from '../types/requestUser';
import { UserStatus } from '@prisma/client';

const mockItemsService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
};

describe('ItemsController', () => {
  let itemsController: ItemsController;
  let itemsService: ItemsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    itemsController = module.get<ItemsController>(ItemsController);
    itemsService = module.get<ItemsService>(ItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('正常系', async () => {
      const expectedItems: Item[] = [
        {
          id: 'test-id1',
          name: 'test-item1',
          price: 100,
          description: '',
          status: ItemStatus.ON_SALE,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          userId: 'test-user1',
        },
      ];

      (itemsService.findAll as jest.Mock).mockResolvedValue(expectedItems);

      const result = await itemsController.findAll();

      expect(result).toEqual(expectedItems);
      expect(itemsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('正常系', async () => {
      const id = 'test-id1';
      const expectedItem: Item = {
        id,
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };

      (itemsService.findById as jest.Mock).mockResolvedValue(expectedItem);

      const result = await itemsController.findById(id);

      expect(result).toEqual(expectedItem);
      expect(itemsService.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('正常系', async () => {
      const createItemDto: CreateItemDto = {
        name: 'test-item1',
        price: 100,
        description: '',
      };

      const user: RequestUser = {
        id: 'test-user1',
        name: 'test-user',
        status: UserStatus.FREE,
      };

      const req = {
        user,
      } as any;

      const expectedItem: Item = {
        id: 'test-id1',
        name: createItemDto.name,
        price: createItemDto.price,
        description: createItemDto.description || null,
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: user.id,
      };

      (itemsService.create as jest.Mock).mockResolvedValue(expectedItem);

      const result = await itemsController.create(createItemDto, req);

      expect(result).toEqual(expectedItem);
      expect(itemsService.create).toHaveBeenCalledWith(createItemDto, user.id);
    });
  });

  describe('updateStatus', () => {
    it('正常系', async () => {
      const id = 'test-id1';
      const user: RequestUser = {
        id: 'test-user1',
        name: 'test-user',
        status: UserStatus.FREE,
      };

      const req = {
        user,
      } as any;

      const expectedItem: Item = {
        id,
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.SOLD_OUT,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: user.id,
      };

      (itemsService.updateStatus as jest.Mock).mockResolvedValue(expectedItem);

      const result = await itemsController.updateStatus(id, req);

      expect(result).toEqual(expectedItem);
      expect(itemsService.updateStatus).toHaveBeenCalledWith(id, user.id);
    });
  });

  describe('delete', () => {
    it('正常系', async () => {
      const id = 'test-id1';
      const user: RequestUser = {
        id: 'test-user1',
        name: 'test-user',
        status: UserStatus.FREE,
      };

      const req = {
        user,
      } as any;

      const expectedItem: Item = {
        id,
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: user.id,
      };

      (itemsService.delete as jest.Mock).mockResolvedValue(expectedItem);

      const result = await itemsController.delete(id, req);

      expect(result).toEqual(expectedItem);
      expect(itemsService.delete).toHaveBeenCalledWith(id, user.id);
    });
  });
});
