import { Table, Column, Model, DataType, HasMany, PrimaryKey, IsEmail, Unique } from 'sequelize-typescript';
import { Encounter } from './Encounter';
import { MedicalRecord } from './MedicalRecord';
import { AuditLog } from './AuditLog';

@Table({
  tableName: 'PROVIDERS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Provider extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(50)
  })
  declare provider_id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare last_name: string;

  @Column(DataType.STRING(100))
  declare specialty: string;

  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare password_hash: string;

  @Column(DataType.STRING(20))
  declare contact_number: string;

  @HasMany(() => Encounter)
  declare encounters: Encounter[];

  @HasMany(() => MedicalRecord)
  declare medical_records: MedicalRecord[];

  @HasMany(() => AuditLog)
  declare audit_logs: AuditLog[];
}
