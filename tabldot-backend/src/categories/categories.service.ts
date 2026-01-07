import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler kategori ekleyebilir.');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler kategori güncelleyebilir.');
    }

    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Güncellenmek istenen kategori bulunamadı.');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Sadece Yöneticiler kategori silebilir.');
    }

    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Silinmek istenen kategori bulunamadı.');
    }

    return this.prisma.category.delete({ where: { id } });
  }
}