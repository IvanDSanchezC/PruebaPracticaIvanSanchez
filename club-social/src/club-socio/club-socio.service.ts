import { Injectable } from '@nestjs/common';
import { ClubEntity } from '../club/club.entity/club.entity';
import { SocioEntity } from '../socio/socio.entity/socio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessLogicException,
  BusinessError,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class ClubSocioService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,
  ) {}

  async addMemberToClub(clubId: string, socioId: string): Promise<ClubEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'No se encontro el socio con el id provisto',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'No se encontro el club con el id provisto',
        BusinessError.NOT_FOUND,
      );

    club.socios = [...club.socios, socio];
    return await this.clubRepository.save(club);
  }

  async findMemberFromClub(
    clubId: string,
    socioId: string,
  ): Promise<SocioEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'No se encontro el socio con el id provisto',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'No se encontro el club con el id provisto',
        BusinessError.NOT_FOUND,
      );

    const clubSocio: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!clubSocio)
      throw new BusinessLogicException(
        'El id del socio no esta asociado con el club',
        BusinessError.PRECONDITION_FAILED,
      );

    return clubSocio;
  }

  async findMembersFromClub(clubId: string): Promise<SocioEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'No se encontro el club con el id provisto',
        BusinessError.NOT_FOUND,
      );

    return club.socios;
  }

  async updateMembersFromClub(
    clubId: string,
    socios: SocioEntity[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club)
      throw new BusinessLogicException(
        'No se encontro el club con el id provisto',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < socios.length; i++) {
      const socio: SocioEntity = await this.socioRepository.findOne({
        where: { id: socios[i].id },
      });
      if (!socio)
        throw new BusinessLogicException(
          'No se encontro el socio con el id provisto',
          BusinessError.NOT_FOUND,
        );
    }

    club.socios = socios;
    return await this.clubRepository.save(club);
  }

  async deleteMemberFromClub(clubId: string, socioId: string) {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'No se encontro el socio con el id provisto',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'No se encontro el club con el id provisto',
        BusinessError.NOT_FOUND,
      );

    const clubSocio: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!clubSocio)
      throw new BusinessLogicException(
        'El id del socio no esta asociado con el club',
        BusinessError.PRECONDITION_FAILED,
      );

    club.socios = club.socios.filter((e) => e.id !== socioId);
    await this.clubRepository.save(club);
  }
}
