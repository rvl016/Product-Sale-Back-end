import { EntityRepository, AbstractRepository } from "typeorm";
import Product from "../entity/product";

@EntityRepository( Product)
export default class ProductRepository extends AbstractRepository<Product> {
  
  async createAndSave( data: Object) {
    const db_product = await this.findByCode( data["code"]);
    if (db_product && ! db_product.is_active) 
      return this.updateAndActivate( db_product, data);
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
    this.manager.merge( Product, product, data);
    return await this.save( product);
  }

  async delete( id: number) {
    const product = await this.manager.findOne( Product, id);
    if (! product)
      return null;
    this.manager.merge( Product, product, { is_active: false });
    return await this.manager.save( Product, product);
  }

  async save( product: Product) {
    return await this.manager.save( Product, product).then( product => {
      return {};
    }).catch( error => { 
      return { error }; 
    });
  }

  async unsafeSave( product: Product) {
    return this.manager.save( Product, product);
  }

  findManyByCodeWithLock( code: String[]) {
    return this.manager.createQueryBuilder( Product, "products")
      .setLock( "pessimistic_write")
      .where( "code IN (:code)")
      .setParameters( { code })
      .getMany();
  }

  private findByCode( code: String) {
    return this.manager.createQueryBuilder( Product, "products")
      .where( "code = :code")
      .setParameters( { code })
      .getOne();
  }

  private updateAndActivate( product: Product, data: Object) {
    data["is_active"] = true;
    this.manager.merge( Product, product, data);
    return this.manager.save( Product, product);
  }
}