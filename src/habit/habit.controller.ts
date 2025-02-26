import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HabitService } from './habit.service';
import { Prisma } from '@prisma/client';
import { Query } from '@nestjs/common';
import { DAYSOFWEEK } from './days';

@Controller('habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post()
  create(@Body() createHabitDto: Prisma.HabitCreateInput) {
    return this.habitService.create(createHabitDto);
  }

  @Get()
  findAll(@Query('today') today?: DAYSOFWEEK) {
    return this.habitService.findAll(today);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.habitService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: Prisma.HabitUpdateInput,
  ) {
    return this.habitService.update(+id, updateHabitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.habitService.remove(+id);
  }
}
