import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { ClubService } from './club.service';
import { ClubEntity } from './club.entity/club.entity';
import { SocioEntity } from '../socio/socio.entity/socio.entity';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubsList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        nombre: faker.lorem.words(3),
        fecha: faker.date.past().toISOString(),
        imagen: faker.image.url(),
        descripcion: faker.lorem.sentence(10), 
      });
      clubsList.push(club);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubsList.length);
  });

  it('findOne should return a club by id', async () => {
    const storedclub: ClubEntity = clubsList[0];
    const club: ClubEntity = await service.findOne(storedclub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedclub.nombre);
    expect(club.fecha).toEqual(storedclub.fecha);
    expect(club.imagen).toEqual(storedclub.imagen);
    expect(club.descripcion).toEqual(storedclub.descripcion);
  });

  it('findOne should throw an exception for an invalid club', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('create should return a new club', async () => {
    const club: ClubEntity = {
      id: faker.string.uuid(),
      nombre: faker.lorem.words(3),
      fecha: faker.date.past().toISOString(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(10), 
      socios: [
        Object.assign(new SocioEntity(), {
          nombre: faker.lorem.words(3),
          correo: faker.internet.email(),
          fecha: faker.date.past().toISOString(),
        }),
      ],
    };

    const newclub: ClubEntity = await service.create(club);
    expect(newclub).not.toBeNull();

    const storedclub: ClubEntity = await repository.findOne({
      where: { id: newclub.id },
    });
    expect(storedclub).not.toBeNull();
    expect(storedclub.nombre).toEqual(newclub.nombre);
    expect(storedclub.fecha).toEqual(newclub.fecha);
    expect(storedclub.imagen).toEqual(newclub.imagen);
    expect(storedclub.descripcion).toEqual(newclub.descripcion);
  });

  it('update should modify a club', async () => {
    const club: ClubEntity = clubsList[0];
    club.nombre = 'Nuevo nombre';
    club.fecha = 'Nueva fecha';

    const updatedclub: ClubEntity = await service.update(club.id, club);
    expect(updatedclub).not.toBeNull();

    const storedclub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(storedclub).not.toBeNull();
    expect(storedclub.nombre).toEqual(club.nombre);
    expect(storedclub.fecha).toEqual(club.fecha);
  });

  it('update should throw an exception for an invalid club', async () => {
    let club: ClubEntity = clubsList[0];
    club = {
      ...club,
      nombre: 'nuevo nombre',
      fecha: 'nueva fecha',
    };
    await expect(() => service.update('0', club)).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);

    const deletedclub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(deletedclub).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontro el club con el id provisto',
    );
  });
});
