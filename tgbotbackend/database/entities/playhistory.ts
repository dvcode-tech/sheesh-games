import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity({
  name: 'play_histories',
})
export class PlayHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'int', default: 0 })
  playerPick: number

  @Column({ type: 'int', default: 0 })
  cpuPick: number

  @ManyToOne(() => User, (user) => user.playhistories)
  user: User

  @Column({ type: 'bigint' })
  created_at: number;

  @Column({ type: 'bigint' })
  updated_at: number;
}
