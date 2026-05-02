import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, Default } from 'sequelize-typescript';
import { Patient } from './Patient';
import { Provider } from './Provider';
import { Encounter } from './Encounter';

@Table({
  tableName: 'MEDICAL_RECORDS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, // Enables soft deletes
  deletedAt: 'deleted_at' // Sequelize uses deletedAt for paranoid mode by default instead of boolean
})
export class MedicalRecord extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare record_id: number;

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

  @ForeignKey(() => Encounter)
  @Column(DataType.INTEGER)
  declare encounter_id: number;

  @BelongsTo(() => Encounter, { onDelete: 'SET NULL' })
  declare encounter: Encounter;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare document_type: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false
  })
  declare file_url: string;

  @Column(DataType.TEXT)
  declare description: string;

  // We map the requested soft_delete boolean to true when deleted_at is set, but Sequelize handles this natively.
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare soft_delete: boolean;
}
