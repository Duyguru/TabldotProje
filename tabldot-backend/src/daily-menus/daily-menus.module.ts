
import { Module } from '@nestjs/common';
import { DailyMenusService } from './daily-menus.service';
import { DailyMenusController } from './daily-menus.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DailyMenusController],
  providers: [DailyMenusService, PrismaService],
})
export class DailyMenusModule {}