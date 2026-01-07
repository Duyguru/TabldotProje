import { Controller, Get, Post, Body, UseGuards, Request, Query, ParseIntPipe, Delete, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @Get()
  findAll(@Query('dailyMenuId') dailyMenuId?: string) {
    let dailyMenuIdNumber: number | undefined = undefined;
    if (dailyMenuId && dailyMenuId.trim() !== '') {
      const parsed = parseInt(dailyMenuId, 10);
      if (!isNaN(parsed)) {
        dailyMenuIdNumber = parsed;
      }
    }
    return this.reviewsService.findAll(dailyMenuIdNumber);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reviewsService.remove(id, req.user.role);
  }
}