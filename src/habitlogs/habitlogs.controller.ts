import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HabitlogsService } from './habitlogs.service';
import { Prisma } from '@prisma/client';

@Controller('habitlogs')
export class HabitlogsController {
  constructor(private readonly habitlogsService: HabitlogsService) {}

  @Post()
  create(@Body() createHabitlogDto: Prisma.HabitLogCreateInput) {
    return this.habitlogsService.create(createHabitlogDto);
  }

  @Get()
  findAll(@Query('habitId') habitId?: string, @Query('start') start?: string) {
    return this.habitlogsService.findAll(habitId, start);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.habitlogsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHabitlogDto: Prisma.HabitLogUpdateInput,
  ) {
    return this.habitlogsService.update(+id, updateHabitlogDto);
  }

  @Delete(':habitId')
  remove(@Param('habitId') id: string) {
    return this.habitlogsService.findLogsAndDelete(+id);
  }
}
