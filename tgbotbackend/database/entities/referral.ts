import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity({
  name: 'referrals',
})
export class Referral extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  referralUserId: number

  @Column({ type: 'bigint' })
  referrerUserId: number

  @OneToOne(() => User, {
    eager: true, nullable: true
  })
  @JoinColumn({ name: 'referralUserId' })
  invitedUser: User

  @ManyToOne(() => User, (user) => user.referrals)
  @JoinColumn({ name: 'referrerUserId' })
  user: User
}
