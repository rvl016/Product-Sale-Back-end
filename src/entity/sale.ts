import { Entity, Column, PrimaryGeneratedColumn, 
  OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Matches, validateOrReject, IsDefined } from 'class-validator';

import Order from './order';

@Entity( "sales")
export default class Sale {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "char",
    length: 12,
    nullable: false
  })
  @IsDefined()
  @Matches( /\d{9}-\d{2}/)
  customer_cpf: String;

  @Column( {
    type: "decimal",
    precision: 10,
    scale: 2
  })
  sale_price: number;

  @OneToMany(
    type => Order,
    order => order.sale_id
  )
  orders: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject( this);
  }
}

