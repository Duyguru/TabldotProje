import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Kategori adı boş olamaz.' })
  @MaxLength(50, { message: 'Kategori adı 50 karakterden uzun olamaz.' })
  name: string;

  @IsString()
  @MaxLength(255, { message: 'Açıklama 255 karakterden uzun olamaz.' })
  description: string;
}