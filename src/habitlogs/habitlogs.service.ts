import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class HabitlogsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createHabitlogDto: Prisma.HabitLogCreateInput) {
    return this.databaseService.habitLog.create({ data: createHabitlogDto });
  }

  findAll(habitId?: string, start?: string) {
    const oneWeek = 604800000;
    let startDate: Date;

    if (start) {
      if (isNaN(Date.parse(start))) {
        throw new Error('Invalid start date');
      }
      startDate = new Date(start);
    } else {
      startDate = new Date(Date.now() - oneWeek);
    }

    const parsedHabitId = habitId ? Number(habitId) : undefined;

    this.normalizeDate(startDate);

    if (parsedHabitId) {
      return this.databaseService.habitLog.findMany({
        where: {
          AND: [
            { date: { gte: startDate.toISOString() } },
            { habitId: { equals: parsedHabitId } },
          ],
        },
      });
    }

    return this.databaseService.habitLog.findMany({
      where: {
        date: { gte: startDate.toISOString() },
      },
    });
  }

  findOne(id: number) {
    return this.databaseService.habitLog.findUnique({
      where: { id },
    });
  }

  update(id: number, updateHabitlogDto: Prisma.HabitLogUpdateInput) {
    return this.databaseService.habitLog.update({
      where: { id },
      data: updateHabitlogDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.habitLog.delete({
      where: { id: id },
    });
  }

  async findLogsAndDelete(habitId: number) {
    const now = new Date();
    this.normalizeDate(now);
    const records = await this.databaseService.habitLog.findMany({
      where: {
        date: now,

        habitId,
      },
    });

    for (const record of records) {
      await this.remove(+record.id);
    }
    return { message: 'Explicit 200 OK' };
  }

  normalizeDate(dateObj: Date) {
    dateObj.setHours(1, 0, 0, 0);
  }
}
