import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  @ValidateIf((o) => o.imageUrl !== undefined && o.imageUrl !== null)
  @IsUrl({ 
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https']
  }, { message: 'imageUrl geçerli bir URL adresi olmalıdır (örn: http://example.com/image.jpg)' })
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}