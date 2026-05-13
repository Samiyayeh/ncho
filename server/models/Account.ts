import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, IsEmail, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'ACCOUNTS',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Account extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare account_id: number;

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

  @Column({
    type: DataType.ENUM('patient', 'provider'),
    allowNull: false
  })
  declare role: string;
}
