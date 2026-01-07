import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DishesService {
  constructor(private prisma: PrismaService) {}

  async create(createDishDto: CreateDishDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler yemek ekleyebilir.');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: createDishDto.categoryId },
    });
    if (!category) throw new NotFoundException('Belirtilen kategori bulunamadı.');

    const imageUrl = createDishDto.imageUrl?.trim() || undefined;
    const description = createDishDto.description?.trim() || undefined;

    return this.prisma.dish.create({
      data: {
        name: createDishDto.name,
        description: description,
        imageUrl: imageUrl,
        categoryId: createDishDto.categoryId,
      },
    });
  }

  findAll() {
    return this.prisma.dish.findMany({ include: { category: true } });
  }

  findOne(id: number) {
    return this.prisma.dish.findUnique({ where: { id }, include: { category: true } });
  }

  async update(id: number, updateDishDto: UpdateDishDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler yemek güncelleyebilir.');
    }

    const existing = await this.prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Güncellenmek istenen yemek bulunamadı.');
    }

    if (updateDishDto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateDishDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Belirtilen kategori bulunamadı.');
      }
    }

    const updateData: any = { ...updateDishDto };
    if (updateData.imageUrl !== undefined) {
      updateData.imageUrl = updateData.imageUrl?.trim() || undefined;
    }
    if (updateData.description !== undefined) {
      updateData.description = updateData.description?.trim() || undefined;
    }

    return this.prisma.dish.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler yemek silebilir.');
    }

    const existing = await this.prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Silinmek istenen yemek bulunamadı.');
    }

    return this.prisma.dish.delete({ where: { id } });
  }
}