import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { DailyMenusService } from './daily-menus.service';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';
import { UpdateDailyMenuDto } from './dto/update-daily-menu.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('daily-menus')
export class DailyMenusController {
  constructor(private readonly dailyMenusService: DailyMenusService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createDailyMenuDto: CreateDailyMenuDto, @Request() req) {
    return this.dailyMenusService.create(createDailyMenuDto, req.user.role);
  }

  @Get()
  findAll() {
    return this.dailyMenusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyMenusService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDailyMenuDto: UpdateDailyMenuDto,
    @Request() req,
  ) {
    return this.dailyMenusService.update(+id, updateDailyMenuDto, req.user.role);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.dailyMenusService.remove(+id, req.user.role);
  }

  @Get('date/today')
  findToday() {
    return this.dailyMenusService.findToday();
  }
}