import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne, PrimaryKey, Default } from 'sequelize-typescript';
import { Patient } from './Patient';
import { Encounter } from './Encounter';

@Table({
  tableName: 'QUEUES',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Queue extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare queue_id: string;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare patient_id: string;

  @BelongsTo(() => Patient)
  declare Patient: Patient;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare queue_number: string;

  @Column({
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW
  })
  declare date: string;

  @Column({
    type: DataType.ENUM('PENDING_TRIAGE', 'WAITING_FOR_PROVIDER', 'IN_CONSULTATION', 'PHARMACY', 'COMPLETED', 'REFERRED_OUT'),
    defaultValue: 'PENDING_TRIAGE',
    allowNull: false
  })
  declare status: string;

  @Column({
    type: DataType.ENUM('OUTPATIENT', 'MEDICINE_DISPENSING', 'YAKAP', 'TB_DOTS', 'SOCIAL_HYGIENE', 'DENTAL', 'HEALTH_PROGRAM'),
    allowNull: false
  })
  declare service_type: string;

  @Column(DataType.JSON)
  declare pre_triage_data: any;

  @HasOne(() => Encounter, { as: 'Encounter' })
  declare Encounter: Encounter;
}
