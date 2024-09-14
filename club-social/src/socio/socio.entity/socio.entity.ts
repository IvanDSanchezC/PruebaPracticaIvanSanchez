import { ClubEntity } from '../../club/club.entity/club.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SocioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  fecha: string;

  @ManyToMany(() => ClubEntity, (club) => club.socios)
  clubes: ClubEntity[];
}
