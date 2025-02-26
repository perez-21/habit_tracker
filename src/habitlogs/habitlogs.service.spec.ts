import { Test, TestingModule } from '@nestjs/testing';
import { HabitlogsService } from './habitlogs.service';

describe('HabitlogsService', () => {
  let service: HabitlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitlogsService],
    }).compile();

    service = module.get<HabitlogsService>(HabitlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
