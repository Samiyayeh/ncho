import { Table, Column, Model, DataType, HasMany, PrimaryKey, IsEmail, Unique } from 'sequelize-typescript';
import { Encounter } from './Encounter';
import { MedicalRecord } from './MedicalRecord';
import { QrAccessToken } from './QrAccessToken';
import { AuditLog } from './AuditLog';
import { Queue } from './Queue';

@Table({
  tableName: 'PATIENTS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Patient extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(50)
  })
  declare patient_id: string;

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

  @Column(DataType.DATEONLY)
  declare date_of_birth: Date;

  @Column(DataType.ENUM('Male', 'Female', 'Other'))
  declare gender: string;

  @Column(DataType.STRING(5))
  declare blood_type: string;

  @Column(DataType.TEXT)
  declare allergies: string;

  @Column(DataType.STRING(20))
  declare contact_number: string;

  @Column(DataType.TEXT)
  declare address: string;

  @Column({
    type: DataType.ENUM('UNVERIFIED', 'ACTIVE'),
    defaultValue: 'UNVERIFIED',
    allowNull: false
  })
  declare account_status: string;

  @Column(DataType.BOOLEAN)
  declare voter_registered: boolean;

  @Column(DataType.BOOLEAN)
  declare household_head: boolean;

  @Column(DataType.TEXT)
  declare chronic_conditions: string;

  @HasMany(() => Encounter)
  declare encounters: Encounter[];

  @HasMany(() => MedicalRecord)
  declare medical_records: MedicalRecord[];

  @HasMany(() => QrAccessToken)
  declare qr_tokens: QrAccessToken[];

  @HasMany(() => AuditLog)
  declare audit_logs: AuditLog[];

  @HasMany(() => Queue)
  declare queues: Queue[];
}
