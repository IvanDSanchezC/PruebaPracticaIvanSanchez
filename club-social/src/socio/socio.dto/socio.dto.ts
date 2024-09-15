import { IsNotEmpty, IsString, IsEmail, IsDateString } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly correo: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  readonly fecha: string;
}
