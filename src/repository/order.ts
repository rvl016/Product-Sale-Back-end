import { EntityRepository, AbstractRepository, 
  getCustomRepository, 
  EntityManager} from "typeorm";

import Order from "../entity/order";
import Product from "../entity/product";

import ProductRepository from "../repository/product";

@EntityRepository( Order)
export default class OrderRepository extends AbstractRepository<Order> {
  
  async createOrdersAndUpdateProducts( data: Object[], sale_id: number,
    manager: EntityManager) {
    const products = await this.getProductRecords( data, manager);
    return await this.createManyAndSave( data, products, sale_id, manager);
  }

  async delete( id: number, manager: EntityManager = this.manager) {
    await manager.delete( Order, id);
  }

  private async getProductRecords( products_data: Object[], 
    manager: EntityManager) {
    const product_codes = products_data.map( product => product["code"]);
    const product_repository = getCustomRepository( ProductRepository);
    return await product_repository.findManyByCodeWithLock( 
      product_codes, manager);
  }

  private async createManyAndSave( products_data: any, products: Product[],
    sale_id: number, manager: EntityManager = this.manager) {
    const product_repository = getCustomRepository( ProductRepository);
    for (const product of products) {
      const product_rec = products_data.find( p => p["code"] == product.code);
      const order = manager.create( Order, { sale_id, 
        quantity: product_rec.quantity, product_id: product.id });
      await manager.save( order);
      await product_repository.changeQuantity( 
        product.id, - order.quantity, manager);
    }
  }

}

