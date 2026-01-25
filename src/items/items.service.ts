import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Item, ItemStatus } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Item[]> {
    return await this.prismaService.item.findMany();
  }

  async findById(id: string): Promise<Item> {
    const item = await this.prismaService.item.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async create(createItemDto: CreateItemDto, userId: string): Promise<Item> {
    // トランザクション内でデータ登録を実行
    return await this.prismaService.$transaction(async (tx) => {
      const { name, price, description } = createItemDto;
      return await tx.item.create({
        data: {
          name,
          price,
          description,
          status: ItemStatus.ON_SALE,
          userId: userId,
        },
      });
    });
  }

  async updateStatus(id: string, userId: string): Promise<Item> {
    // トランザクション内で存在チェックと更新を実行
    return await this.prismaService.$transaction(async (tx) => {
      // 存在チェックと所有者チェックを同時に実行
      const item = await tx.item.findUnique({
        where: { id },
      });

      if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }

      if (item.userId !== userId) {
        throw new ForbiddenException('You can only update your own items');
      }

      // 所有者チェックをwhere条件に含めて更新（より安全）
      const updatedItem = await tx.item.update({
        data: { status: ItemStatus.SOLD_OUT },
        where: {
          id,
          userId, // 所有者チェックをwhere条件に含める
        },
      });

      return updatedItem;
    });
  }

  async delete(id: string, userId: string): Promise<Item> {
    // トランザクション内で存在チェックと削除を実行
    return await this.prismaService.$transaction(async (tx) => {
      // 存在チェックと所有者チェックを同時に実行
      const item = await tx.item.findUnique({
        where: { id },
      });

      if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }

      if (item.userId !== userId) {
        throw new ForbiddenException('You can only delete your own items');
      }

      // 所有者チェックをwhere条件に含めて削除（より安全）
      const deletedItem = await tx.item.delete({
        where: {
          id,
          userId, // 所有者チェックをwhere条件に含める
        },
      });

      return deletedItem;
    });
  }
}
