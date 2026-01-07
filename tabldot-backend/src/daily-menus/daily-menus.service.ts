import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';
import { UpdateDailyMenuDto } from './dto/update-daily-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DailyMenusService {
  constructor(private prisma: PrismaService) {}

  async create(createDailyMenuDto: CreateDailyMenuDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler menü oluşturabilir.');
    }

    return this.prisma.dailyMenu.create({
      data: {
        date: new Date(createDailyMenuDto.date),
        dishes: {
          connect: createDailyMenuDto.dishIds.map((id) => ({ id })),
        },
      },
      include: { dishes: true },
    });
  }

  findAll() {
    return this.prisma.dailyMenu.findMany({
      include: { dishes: true },
      orderBy: { date: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.dailyMenu.findUnique({ where: { id }, include: { dishes: true } });
  }

  async update(id: number, updateDailyMenuDto: UpdateDailyMenuDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler menü güncelleyebilir.');
    }

    const existing = await this.prisma.dailyMenu.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Güncellenmek istenen menü bulunamadı.');
    }

    const data: any = {};

    if (updateDailyMenuDto.date !== undefined) {
      data.date = new Date(updateDailyMenuDto.date);
    }

    if (updateDailyMenuDto.dishIds !== undefined) {
      data.dishes = {
        set: updateDailyMenuDto.dishIds.map((dishId) => ({ id: dishId })),
      };
    }

    return this.prisma.dailyMenu.update({
      where: { id },
      data,
      include: { dishes: true },
    });
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler menü silebilir.');
    }

    const existing = await this.prisma.dailyMenu.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Silinmek istenen menü bulunamadı.');
    }

    return this.prisma.dailyMenu.delete({ where: { id } });
  }

  findToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.prisma.dailyMenu.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: { dishes: { include: { category: true } } },
      orderBy: { date: 'asc' },
    });
  }
}