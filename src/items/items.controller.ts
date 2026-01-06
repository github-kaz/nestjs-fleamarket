import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import type { Item } from './items.model';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}
    @Get()
    findAll(): Item[] {
        return this.itemsService.findAll();
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string): Item {
        return this.itemsService.findById(id);
    }

    @Post()
    create(@Body() createItemDto: CreateItemDto): Item {
        return this.itemsService.create(createItemDto);
    }

    @Put(':id')
    updateStatus(@Param('id', ParseUUIDPipe) id: string): Item {
        return this.itemsService.updateStatus(id);
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string): void {
        return this.itemsService.delete(id);
    }
}
