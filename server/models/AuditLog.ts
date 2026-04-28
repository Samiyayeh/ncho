import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Patient } from './Patient';
import { Provider } from './Provider';

@Table({
  tableName: 'AUDIT_LOGS',
  timestamps: true,
  createdAt: 'timestamp', // Custom name mapped to timestamp column
  updatedAt: false // Schema only specifies timestamp
})
export class AuditLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare log_id: number;

  @ForeignKey(() => Provider)
  @Column(DataType.STRING(50))
  declare provider_id: string;

  @BelongsTo(() => Provider, { onDelete: 'SET NULL' })
  declare provider: Provider;

  @ForeignKey(() => Patient)
  @Column(DataType.STRING(50))
  declare patient_id: string;

  @BelongsTo(() => Patient, { onDelete: 'SET NULL' })
  declare patient: Patient;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare action_taken: string;

  @Column(DataType.STRING(255))
  declare endpoint_accessed: string;

  @Column(DataType.STRING(45))
  declare ip_address: string;
}
