import { Entity, Column, PrimaryGeneratedColumn,
  BeforeInsert, BeforeUpdate, AfterLoad, } from 'typeorm';
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
  @Min( 0.0)
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
    default: true,
    nullable: false
  })
  is_active: boolean;

  @BeforeUpdate()
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject( this);
  }

  @AfterLoad()
  convertPriceToFloat() {
    this.price = parseFloat( this.price as any);
  }
}