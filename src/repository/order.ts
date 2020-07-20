import { EntityRepository, AbstractRepository, 
  getCustomRepository } from "typeorm";

import Order from "../entity/order";
import Product from "../entity/product";

import ProductRepository from "../repository/product";

@EntityRepository( Order)
export default class OrderRepository extends AbstractRepository<Order> {
  
  async createOrdersAndUpdateProducts( data: Object[], sale_id: number) {
    const products = await this.getProductRecords( data);
    return await this.createManyAndSave( data, products, sale_id);
  }

  async delete( id: number) {
    await this.manager.delete( Order, id);
  }

  private getProductRecords( products_data: Object[]) {
    const product_codes = products_data.map( product => product["code"]);
    const product_repository = getCustomRepository( ProductRepository);
    return product_repository.findManyByCodeWithLock( product_codes);
  }

  private async createManyAndSave( products_data: any, 
    products: Product[], sale_id: number) {
    const product_repository = getCustomRepository( ProductRepository);
    products.map( async product => {
      const product_rec = products_data.find( p => p["code"] == product.code);
      const order = this.manager.create( Order, { sale_id, 
        quantity: product_rec["quantity"], product_id: product.id });
      await this.manager.save( order);
      await product_repository.changeQuantity( 
        product_rec.id, - order.quantity);
      return order;
    });
  }

}

