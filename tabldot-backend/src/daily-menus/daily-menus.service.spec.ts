import { Test, TestingModule } from '@nestjs/testing';
import { DailyMenusService } from './daily-menus.service';

describe('DailyMenusService', () => {
  let service: DailyMenusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyMenusService],
    }).compile();

    service = module.get<DailyMenusService>(DailyMenusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
