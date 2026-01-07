import { Test, TestingModule } from '@nestjs/testing';
import { DailyMenusController } from './daily-menus.controller';
import { DailyMenusService } from './daily-menus.service';

describe('DailyMenusController', () => {
  let controller: DailyMenusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyMenusController],
      providers: [DailyMenusService],
    }).compile();

    controller = module.get<DailyMenusController>(DailyMenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
