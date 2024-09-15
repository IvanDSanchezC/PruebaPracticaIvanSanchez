import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { SocioService } from './socio.service';
import { ClubEntity } from '../club/club.entity/club.entity';
import { SocioEntity } from './socio.entity/socio.entity';


describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await repository.save({
        nombre: faker.lorem.words(3),
        correo: faker.internet.email(),
        fecha: faker.date.past().toISOString(),
      });
      sociosList.push(socio);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });

  it('findOne should return a socio by id', async () => {
    const storedsocio: SocioEntity = sociosList[0];
    const socio: SocioEntity = await service.findOne(storedsocio.id);
    expect(socio).not.toBeNull();
    expect(socio.nombre).toEqual(storedsocio.nombre);
    expect(socio.correo).toEqual(storedsocio.correo);
    expect(socio.fecha).toEqual(storedsocio.fecha);
  });

  it('findOne should throw an exception for an invalid socio', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('create should return a new socio', async () => {
    const socio: SocioEntity = {
      id: faker.string.uuid(),
      nombre: faker.lorem.words(3),
      correo: faker.internet.email(),
      fecha: faker.date.past().toISOString(),
      clubs: [
        Object.assign(new ClubEntity(), {
          nombre: faker.lorem.words(3),
          fecha: faker.date.past().toISOString(),
          imagen: faker.image.url(),
          descripcion: faker.lorem.sentence(10),
        }),
      ],
    };

    const newsocio: SocioEntity = await service.create(socio);
    expect(newsocio).not.toBeNull();

    const storedsocio: SocioEntity = await repository.findOne({
      where: { id: newsocio.id },
    });
    expect(storedsocio).not.toBeNull();
    expect(storedsocio.nombre).toEqual(newsocio.nombre);
    expect(storedsocio.correo).toEqual(newsocio.correo);
    expect(storedsocio.fecha).toEqual(newsocio.fecha);
  });

  it('update should modify a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombre = 'Nuevo nombre';
    socio.correo = 'Nuevo correo';

    const updatedsocio: SocioEntity = await service.update(socio.id, socio);
    expect(updatedsocio).not.toBeNull();

    const storedsocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(storedsocio).not.toBeNull();
    expect(storedsocio.nombre).toEqual(socio.nombre);
    expect(storedsocio.correo).toEqual(socio.correo);
  });

  it('update should throw an exception for an invalid socio', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      nombre: 'nuevo nombre',
      correo: 'nuevo correo',
    };
    await expect(() => service.update('0', socio)).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });

  it('delete should remove a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);

    const deletedsocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(deletedsocio).toBeNull();
  });

  it('delete should throw an exception for an invalid socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontro el socio con el id provisto',
    );
  });
});
