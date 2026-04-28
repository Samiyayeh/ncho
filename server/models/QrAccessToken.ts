import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, Default, Unique } from 'sequelize-typescript';
import { Patient } from './Patient';

@Table({
  tableName: 'QR_ACCESS_TOKENS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Schema only specifies created_at
})
export class QrAccessToken extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare token_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare patient_id: string;

  @BelongsTo(() => Patient, { onDelete: 'CASCADE' })
  declare patient: Patient;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare token_string: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare expires_at: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;
}
