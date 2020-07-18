import { BaseEntity, Entity, Column, 
  PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Matches } from 'class-validator';

import { Order } from './order';

@Entity( "sales")
export class Sale extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "char",
    length: 12
  })
  @Matches( /\d{9}-\d{2}/)
  client_cpf: String;

  @OneToMany(
    type => Order,
    order => order.sale_id
  )
  orders: Order[];

}

