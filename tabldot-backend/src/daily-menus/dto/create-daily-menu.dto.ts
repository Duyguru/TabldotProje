import { IsArray, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateDailyMenuDto {
  @IsISO8601()
  @IsNotEmpty()
  date: string;

  @IsArray()
  @IsNotEmpty()
  dishIds: number[];
}