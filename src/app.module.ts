import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HabitModule } from './habit/habit.module';
import { HabitlogsModule } from './habitlogs/habitlogs.module';

@Module({
  imports: [DatabaseModule, HabitModule, HabitlogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
