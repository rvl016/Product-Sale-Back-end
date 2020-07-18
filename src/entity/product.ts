import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Min, Matches } from 'class-validator';

@Entity( "products")
export class Product extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "varchar",
    length: 100
  })
  name: String;

  @Column( {
    type: "char",
    length: 10,
    unique: true,
  })
  @Matches( /\d{10}/)
  code: String;

  @Column( { 
    type: "decimal",
    precision: 10, 
    scale: 2
  })
  price: number;

  @Column( {
    type: "integer"
  })
  @Min( 0)
  quantity: number;

  @Column( {
    type: "boolean",
    default: true
  })
  is_active: boolean;

  
}