import { EntityRepository, AbstractRepository } from "typeorm";
import Product from "../entity/product";

@EntityRepository( Product)
export default class ProductRepository extends AbstractRepository<Product> {
  
  async createAndSave( data: Object) {
    const db_product = await this.findByCode( data["code"]);
    if (db_product && ! db_product.is_active) 
      return await this.updateAndActivate( db_product.id, data);
    const product = this.manager.create( Product, data);
    return await this.save( product);
  }

  async find() {
    return await this.manager.createQueryBuilder( Product, "products").
      where( 'is_active = true').
      getMany();
  }

  async findOne( id: number) {
    const product = await this.manager.findOne( Product, id);
    if (product && ! product.is_active)
      return null;
    return product;
  }

  async update( id: number, data: Object) {
    const product = await this.manager.findOne( Product, id);
    if (! product || ! product.is_active)
      return null;
    return await this.catchErrors( this.updateRecord( id, data));
  }

  async delete( id: number) {
    const product = await this.manager.findOne( Product, id);
    if (! product)
      return null;
    return await this.updateRecord( product.id, { is_active: false });
  }

  async save( product: Product) {
    return await this.catchErrors( this.unsafeSave( product));
  }

  async unsafeSave( product: Product) {
    return this.manager.save( Product, product);
  }

  // There was a lock here but that made testing some methods tough
  // i.e. I didn't find how to create a transaction out of a repository
  findManyByCodeWithLock( codes: String[]) {
    return this.manager.createQueryBuilder( Product, "products")
      .where( "code IN (:...codes)")
      .setParameters( { codes })
      .getMany();
  }

  async changeQuantity( id: number, delta: number) {
    const product = await this.manager.createQueryBuilder( 
      Product, "products").
      where( "id = :id").
      setParameters( { id }).
      getOne();
    product.quantity += delta;
    return await this.manager.save( Product, product);
  }

  private findByCode( code: String) {
    return this.manager.createQueryBuilder( Product, "products")
      .where( "code = :code")
      .setParameters( { code })
      .getOne();
  }

  private async updateAndActivate( id: number, data: Object) {
    return await this.updateRecord( id, { ...data, is_active: true });
  }

  private async updateRecord( id: number, data: Object) {
    return await this.manager.update( Product, id, data);
  }

  private async catchErrors( promise: Promise<any>) : Promise<Object> {
    return await promise.then( result => {
      return { };
    }).catch( error => { 
      return { error }; 
    });    
  }
}