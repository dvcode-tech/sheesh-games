import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Referral } from './referral';
import { PlayHistory } from './playhistory';

@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  telegram_user_id: string;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'bigint' })
  created_at: number;

  @Column({ type: 'bigint' })
  updated_at: number;

  @Column({ type: 'text', select: false })
  auth_hash: string;

  @Column({ type: 'bigint', nullable: true, unique: false })
  referrerUserId?: number

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "referrerUserId", referencedColumnName: "id" })
  referrer?: User;

  @OneToMany(() => Referral, (referral) => referral.user)
  referrals: Referral[]

  @Column({ type: 'bigint', default: 0 })
  next_play_at: number

  @Column({ type: 'bigint', default: 0 })
  remaining_play_count: number

  @Column({ type: 'bigint', default: 0 })
  wins: number

  @Column({ type: 'bigint', default: 0 })
  losses: number

  @OneToMany(() => PlayHistory, (playhistory) => playhistory.user)
  playhistories: PlayHistory[]
}
