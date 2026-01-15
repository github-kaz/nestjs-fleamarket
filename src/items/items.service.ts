import { Injectable } from '@nestjs/common';
import { Item, ItemStatus } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
        const { name, price, description } = createItemDto;
        return await this.prismaService.item.create({
            data: {
                name,
                price,
                description,
                status: ItemStatus.ON_SALE,
                userId: userId,
            },
        });
    }

    async updateStatus(id: string): Promise<Item> {
        // 存在チェック（findById内で例外が投げられる）
        await this.findById(id);
        
        // DBに更新を保存
        return await this.prismaService.item.update({
            data: { status: ItemStatus.SOLD_OUT },
            where: { id },
        });
    }

    async delete(id: string): Promise<Item> {
        // 存在チェック（findById内で例外が投げられる）
        await this.findById(id);
        
        // DBから削除
        return await this.prismaService.item.delete({
            where: { id },
        });
    }
}
