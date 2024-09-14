import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SocioEntity } from 'src/socio/socio.entity/socio.entity';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  fecha: string;

  @Column()
  imagen: string;

  @Column({ type: 'varchar', length: 100 })
  descripcion: string;

  @ManyToMany(() => SocioEntity, (socio) => socio.clubes)
  @JoinTable()
  socios: SocioEntity[];
}
