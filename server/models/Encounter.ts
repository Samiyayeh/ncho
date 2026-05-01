import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Patient } from './Patient';
import { Provider } from './Provider';
import { Prescription } from './Prescription';
import { MedicalRecord } from './MedicalRecord';

@Table({
  tableName: 'ENCOUNTERS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Encounter extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare encounter_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare patient_id: string;

  @BelongsTo(() => Patient, { as: 'Patient', onDelete: 'CASCADE' })
  declare Patient: Patient;

  @ForeignKey(() => Provider)
  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare provider_id: string;

  @BelongsTo(() => Provider, { as: 'Provider', onDelete: 'CASCADE' })
  declare Provider: Provider;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare encounter_date: Date;

  @Column(DataType.STRING(20))
  declare blood_pressure: string;

  @Column(DataType.INTEGER)
  declare heart_rate: number;

  @Column(DataType.DECIMAL(5, 2))
  declare temperature: number;

  @Column(DataType.DECIMAL(5, 2))
  declare weight: number;

  @Column(DataType.TEXT)
  declare chief_complaint: string;

  @Column(DataType.TEXT)
  declare diagnosis: string;

  @Column(DataType.TEXT)
  declare treatment_notes: string;

  @HasMany(() => Prescription, { as: 'Prescriptions' })
  declare Prescriptions: Prescription[];

  @HasMany(() => MedicalRecord)
  declare medical_records: MedicalRecord[];
}
