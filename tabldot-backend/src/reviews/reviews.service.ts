import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, user: any) {
    const dish = await this.prisma.dish.findUnique({
      where: { id: createReviewDto.dishId },
    });

    if (!dish) {
      throw new NotFoundException('Yorum yapmaya çalıştığınız yemek bulunamadı.');
    }

    const dailyMenu = await this.prisma.dailyMenu.findUnique({
      where: { id: createReviewDto.dailyMenuId },
      include: { dishes: true },
    });

    if (!dailyMenu) {
      throw new NotFoundException('Yorum yapmaya çalıştığınız günün menüsü bulunamadı.');
    }

    const dishInMenu = dailyMenu.dishes.some((d) => d.id === createReviewDto.dishId);
    if (!dishInMenu) {
      throw new NotFoundException('Bu yemek seçilen günün menüsünde bulunmamaktadır.');
    }

    return this.prisma.review.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        dishId: createReviewDto.dishId,
        dailyMenuId: createReviewDto.dailyMenuId,
        userId: user.id,
      },
      include: {
        dish: { select: { name: true } },
        user: { select: { email: true, name: true } },
        dailyMenu: { select: { date: true } },
      },
    });
  }

  findAll(dailyMenuId?: number) {
    return this.prisma.review.findMany({
      where: dailyMenuId ? { dailyMenuId } : undefined,
      include: {
        dish: { select: { name: true } },
        user: { select: { email: true, name: true } },
        dailyMenu: { select: { date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new NotFoundException('Sadece yöneticiler yorum silebilir.');
    }

    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Silinmek istenen yorum bulunamadı.');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
