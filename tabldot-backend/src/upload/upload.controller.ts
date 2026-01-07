import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new Error('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WEBP)'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenemedi. Lütfen bir dosya seçin.');
    }

    try {
      const uploadPath = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const ext = extname(file.originalname).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExts.includes(ext)) {
        throw new BadRequestException('Geçersiz dosya formatı. Sadece JPG, PNG, GIF, WEBP dosyaları yüklenebilir.');
      }

      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
      const filename = `dish-${uniqueSuffix}${ext}`;
      const filePath = join(uploadPath, filename);

      fs.writeFileSync(filePath, file.buffer);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fileUrl = `${baseUrl}/uploads/${filename}`;

      return {
        url: fileUrl,
        filename: filename,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Dosya yükleme hatası:', error);
      throw new InternalServerErrorException('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
}

