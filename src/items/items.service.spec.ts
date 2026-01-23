import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Item, ItemStatus } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';

const mockPrismaService = {
  item: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ItemsServiceTest', () => {
  let itemsService: ItemsService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();
    itemsService = module.get<ItemsService>(ItemsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('正常系', async () => {
      (prismaService.item.findMany as jest.Mock).mockResolvedValue([]);
      const expected = [];
      const result = await itemsService.findAll();
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('正常系', async () => {
      const item: Item = {
        id: 'test-id1',
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(item);
      const result = await itemsService.findById('test-id1');
      expect(result).toEqual(item);
      expect(prismaService.item.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id1' },
      });
    });

    it('異常系: 商品が存在しない', async () => {
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(itemsService.findById('test-id1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('正常系', async () => {
      const createItemDto: CreateItemDto = {
        name: 'test-item1',
        price: 100,
        description: '',
      };
      const userId = 'test-user1';
      const expected: Item = {
        id: 'test-id1',
        name: createItemDto.name,
        price: createItemDto.price,
        description: createItemDto.description || null,
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId,
      };
      (prismaService.item.create as jest.Mock).mockResolvedValue(expected);
      const result = await itemsService.create(createItemDto, userId);
      expect(result).toEqual(expected);
      expect(prismaService.item.create).toHaveBeenCalledWith({
        data: {
          name: createItemDto.name,
          price: createItemDto.price,
          description: createItemDto.description,
          status: ItemStatus.ON_SALE,
          userId,
        },
      });
    });
  });

  describe('updateStatus', () => {
    it('正常系', async () => {
      const item: Item = {
        id: 'test-id1',
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };
      const userId = 'test-user1';
      (prismaService.item.update as jest.Mock).mockResolvedValue(item);
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(item);
      const result = await itemsService.updateStatus('test-id1', userId);
      expect(result).toEqual(item);
      expect(prismaService.item.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id1' },
      });
      expect(prismaService.item.update).toHaveBeenCalledWith({
        data: { status: ItemStatus.SOLD_OUT },
        where: { id: 'test-id1' },
      });
    });

    it('異常系: 所有者でない', async () => {
      const item: Item = {
        id: 'test-id1',
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };
      const differentUserId = 'test-user2';
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(item);
      await expect(
        itemsService.updateStatus('test-id1', differentUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('正常系', async () => {
      const item: Item = {
        id: 'test-id1',
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };
      const userId = 'test-user1';
      (prismaService.item.delete as jest.Mock).mockResolvedValue(item);
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(item);
      const result = await itemsService.delete('test-id1', userId);
      expect(result).toEqual(item);
      expect(prismaService.item.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id1' },
      });
      expect(prismaService.item.delete).toHaveBeenCalledWith({
        where: { id: 'test-id1' },
      });
    });

    it('異常系: 所有者でない', async () => {
      const item: Item = {
        id: 'test-id1',
        name: 'test-item1',
        price: 100,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userId: 'test-user1',
      };
      const differentUserId = 'test-user2';
      (prismaService.item.findUnique as jest.Mock).mockResolvedValue(item);
      await expect(
        itemsService.delete('test-id1', differentUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
