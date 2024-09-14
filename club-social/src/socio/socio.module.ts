import { Module } from '@nestjs/common';
import { SocioService } from './socio.service';
import { SocioEntity } from './socio.entity/socio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SocioEntity])],
  providers: [SocioService],
})
export class SocioModule {}
