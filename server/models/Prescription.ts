import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Encounter } from './Encounter';

@Table({
  tableName: 'PRESCRIPTIONS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Schema only specifies created_at
})
export class Prescription extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare prescription_id: number;

  @ForeignKey(() => Encounter)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare encounter_id: number;

  @BelongsTo(() => Encounter, { onDelete: 'CASCADE' })
  declare encounter: Encounter;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare medication_name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare dosage: string;

  @Column({
    type: DataType.ENUM('OD', 'BID', 'TID', 'QID'),
    allowNull: false
  })
  declare frequency: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare duration_days: number;
}
