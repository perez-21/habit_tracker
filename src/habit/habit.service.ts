import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { DAYSOFWEEK } from './days';

@Injectable()
export class HabitService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createHabitDto: Prisma.HabitCreateInput) {
    return this.databaseService.habit.create({
      data: createHabitDto,
    });
  }

  async findAll(today?: DAYSOFWEEK) {
    if (today) {
      const habits = await this.databaseService.habit.findMany({
        where: {
          OR: [
            // frequency = 'WEEKLY' AND 'FRIDAY' = ANY(daysOfWeek)
            {
              AND: [
                { goalDays: null },
                {
                  OR: [{ frequency: 'DAILY' }, { daysOfWeek: { has: today } }],
                },
              ],
            },
            {
              AND: [
                {
                  goalDays: {
                    not: null,
                  },
                },
                {
                  OR: [{ frequency: 'DAILY' }, { daysOfWeek: { has: today } }],
                },
              ],
            },
          ],
        },
      });

      const filteredHabits = habits.filter((habit) => {
        const startDate = new Date(habit.startDate);
        const today = new Date();
        this.normalizeDate(today);
        const daysFromStart =
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (habit.goalDays === null) {
          return true;
        }
        return habit.goalDays >= daysFromStart;
      });
      return filteredHabits;
    }
    return this.databaseService.habit.findMany();
  }

  async findOne(id: number) {
    return this.databaseService.habit.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateHabitDto: Prisma.HabitUpdateInput) {
    return this.databaseService.habit.update({
      where: { id },
      data: updateHabitDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.habit.delete({
      where: { id },
    });
  }

  normalizeDate(dateObj: Date) {
    dateObj.setHours(1, 0, 0, 0);
  }
}
