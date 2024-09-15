import { IsNotEmpty, IsString, IsDateString, IsUrl } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsDateString()
  @IsNotEmpty()
  readonly fecha: string;

  @IsUrl()
  @IsNotEmpty()
  readonly imagen: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;
}
