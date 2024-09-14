import { Test, TestingModule } from '@nestjs/testing';
import { ClubSocioService } from './club-socio.service';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity/club.entity';
import { SocioEntity } from '../socio/socio.entity/socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let club: ClubEntity;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(ClubSocioService);
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    socioRepository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    socioRepository.clear();
    clubRepository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await socioRepository.save({
        nombre: faker.lorem.words(3),
        correo: faker.internet.email(),
        fecha: faker.date.past().toISOString(),
      });
      sociosList.push(socio);
    }

    club = await clubRepository.save({
      nombre: faker.lorem.words(3),
      fecha: faker.date.past().toISOString(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(10),
      socios: sociosList,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add an socio to a club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    const newClub: ClubEntity = await clubRepository.save({
      nombre: faker.lorem.words(3),
      fecha: faker.date.past().toISOString(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(10),
    });

    const result: ClubEntity = await service.addMemberToClub(
      newClub.id,
      newSocio.id,
    );

    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].nombre).toBe(newSocio.nombre);
    expect(result.socios[0].correo).toBe(newSocio.correo);
    expect(result.socios[0].fecha).toBe(newSocio.fecha);
  });

  it('addMemberToClub should thrown exception for an invalid socio', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      nombre: faker.lorem.words(3),
      fecha: faker.date.past().toISOString(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(10),
    });

    await expect(() =>
      service.addMemberToClub(newClub.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('addMemberToClub should throw an exception for an invalid club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    await expect(() =>
      service.addMemberToClub('0', newSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('findMemberFromClub should return socio by club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocio: SocioEntity = await service.findMemberFromClub(
      club.id,
      socio.id,
    );
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toBe(socio.nombre);
    expect(storedSocio.correo).toBe(socio.correo);
    expect(storedSocio.fecha).toBe(socio.fecha);
  });

  it('findMemberFromClub should throw an exception for an invalid socio', async () => {
    await expect(() =>
      service.findMemberFromClub(club.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('findMemberFromClub should throw an exception for an invalid club', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.findMemberFromClub('0', socio.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('findMemberFromClub should throw an exception for an socio not associated to the club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    await expect(() =>
      service.findMemberFromClub(club.id, newSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'El id del socio no esta asociado con el club',
    );
  });

  it('findMembersFromClub should return socios by club', async () => {
    const socios: SocioEntity[] = await service.findMembersFromClub(club.id);
    expect(socios.length).toBe(5);
  });

  it('findMembersFromClub should throw an exception for an invalid club', async () => {
    await expect(() => service.findMembersFromClub('0')).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('updateMembersFromClub should update socios list for a club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    const updatedClub: ClubEntity = await service.updateMembersFromClub(club.id, [
      newSocio,
    ]);
    expect(updatedClub.socios.length).toBe(1);

    expect(updatedClub.socios[0].nombre).toBe(newSocio.nombre);
    expect(updatedClub.socios[0].correo).toBe(newSocio.correo);
    expect(updatedClub.socios[0].fecha).toBe(newSocio.fecha);
  });

  it('updateMembersFromClub should throw an exception for an invalid club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    await expect(() =>
      service.updateMembersFromClub('0', [newSocio]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('updateMembersFromClub should throw an exception for an invalid socio', async () => {
    const newSocio: SocioEntity = sociosList[0];
    newSocio.id = '0';

    await expect(() =>
      service.updateMembersFromClub(club.id, [newSocio]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('deleteSocioToClub should remove an socio from a club', async () => {
    const socio: SocioEntity = sociosList[0];

    await service.deleteMemberFromClub(club.id, socio.id);

    const storedClub: ClubEntity = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['socios'],
    });
    const deletedSocio: SocioEntity = storedClub.socios.find(
      (a) => a.id === socio.id,
    );

    expect(deletedSocio).toBeUndefined();
  });

  it('deleteSocioToClub should thrown an exception for an invalid socio', async () => {
    await expect(() =>
      service.deleteMemberFromClub(club.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('deleteSocioToClub should thrown an exception for an invalid club', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.deleteMemberFromClub('0', socio.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('deleteSocioToClub should thrown an exception for an non asocciated socio', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
    });

    await expect(() =>
      service.deleteMemberFromClub(club.id, newSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'El id del socio no esta asociado con el club',
    );
  });
});
