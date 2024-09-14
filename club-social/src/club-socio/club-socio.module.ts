import { Module } from '@nestjs/common';
import { ClubSocioService } from './club-socio.service';
import { ClubEntity } from '../club/club.entity/club.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocioEntity } from '../socio/socio.entity/socio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity, SocioEntity])],
  providers: [ClubSocioService]
})
export class ClubSocioModule {}
