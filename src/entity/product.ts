import { Entity, Column, PrimaryGeneratedColumn,
  BeforeInsert, BeforeUpdate, } from 'typeorm';
import { Min, Matches, validateOrReject, IsDefined } from 'class-validator';

@Entity( "products")
export default class Product {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {
    type: "varchar",
    length: 100,
    nullable: false
  })
  @IsDefined()
  name: String;

  @Column( {
    type: "char",
    length: 10,
    unique: true,
    nullable: false
  })
  @IsDefined()
  @Matches( /\d{10}/)
  code: String;

  @Column( { 
    type: "decimal",
    precision: 10, 
    scale: 2,
    nullable: false
  })
  @IsDefined()
  price: number;

  @Column( {
    type: "integer",
    nullable: false
  })
  @IsDefined()
  @Min( 0)
  quantity: number;

  @Column( {
    type: "boolean",
    default: true
  })
  is_active: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject( this);
  }
}