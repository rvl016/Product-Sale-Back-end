import { Entity, Column, PrimaryGeneratedColumn, ManyToOne,
  BeforeInsert, BeforeUpdate, } from 'typeorm';
import { Min, validateOrReject, IsDefined } from 'class-validator';

import Sale from './sale';
import Product from './product';

@Entity( "orders")
export default class Order {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "integer",
    nullable: false
  })
  @IsDefined()
  @Min( 1)
  quantity: number;

  @ManyToOne(
    type => Sale,
    sale => sale.orders,
    { nullable: false }
  )
  sale_id: number;

  @ManyToOne(
    type => Product,
    product => product.id,
    { nullable: false }
  )
  product_id: number;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject( this);
  }
}


