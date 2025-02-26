import { Module } from '@nestjs/common';
import { HabitlogsService } from './habitlogs.service';
import { HabitlogsController } from './habitlogs.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HabitlogsController],
  providers: [HabitlogsService],
})
export class HabitlogsModule {}
