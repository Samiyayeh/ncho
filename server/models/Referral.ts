import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Encounter } from './Encounter';

@Table({
  tableName: 'REFERRALS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Referral extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare referral_id: number;

  @ForeignKey(() => Encounter)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare encounter_id: number;

  @BelongsTo(() => Encounter)
  declare Encounter: Encounter;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare destination_facility: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare reason_for_referral: string;

  @Column({
    type: DataType.ENUM('OUTBOUND', 'RETURNED_WITH_RESULTS', 'CLOSED'),
    defaultValue: 'OUTBOUND',
    allowNull: false
  })
  declare status: string;
}
