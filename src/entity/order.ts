import { BaseEntity, Entity, Column, 
  PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Min } from 'class-validator';

import { Sale } from './sale';
import { Product } from './product';

@Entity( "orders")
export class Order extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "integer",
    nullable: false
  })
  @Min( 0)
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

}


