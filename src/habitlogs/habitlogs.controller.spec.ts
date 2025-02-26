import { Test, TestingModule } from '@nestjs/testing';
import { HabitlogsController } from './habitlogs.controller';
import { HabitlogsService } from './habitlogs.service';

describe('HabitlogsController', () => {
  let controller: HabitlogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitlogsController],
      providers: [HabitlogsService],
    }).compile();

    controller = module.get<HabitlogsController>(HabitlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
