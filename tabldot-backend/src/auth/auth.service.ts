import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    let role = 'USER';
    if (registerDto.adminKey) {
      const adminKey = this.configService.get<string>('ADMIN_KEY') || 'ADMIN_SECRET_KEY_2024';
      if (registerDto.adminKey === adminKey) {
        role = 'ADMIN';
      } else {
        throw new BadRequestException('Geçersiz admin anahtarı.');
      }
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          role: role,
        },
      });
      return { 
        message: 'Kayıt başarılı', 
        userId: user.id,
        role: user.role 
      };
    } catch (error) {
      if (error.code === 'P2002') throw new ConflictException('E-posta zaten var.');
      throw new InternalServerErrorException();
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}