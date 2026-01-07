// src/auth/auth.service.ts

import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    // 1. Şifreyi şifrele (Hashleme)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 2. Kullanıcıyı kaydetme denemesi
    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          // İlk kaydolan kullanıcı otomatik 'USER' rolünde başlar.
          // Admin'i veritabanından elle atayacağız (birazdan).
        },
        select: { // Şifreyi geri göndermiyoruz
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      return user;

    } catch (error) {
      // Eğer e-posta zaten varsa Prisma hata verir (P2002: unique constraint failed)
      if (error.code === 'P2002') {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
      }
      // Diğer tüm beklenmeyen hatalar
      throw new InternalServerErrorException('Kayıt olurken bir hata oluştu.');
    }
  }
}