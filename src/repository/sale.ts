import { EntityRepository, AbstractRepository, Transaction, TransactionManager, getCustomRepository, EntityManager } from "typeorm";
import Sale from "../entity/sale";
import Order from "../entity/order";
import Product from "../repository/product";
import ProductRepository from "../repository/product";
import OrderRepository from "./order";

@EntityRepository( Sale)
export default class SaleRepository extends AbstractRepository<Sale> {
  
  async createAndSave( data: Object) : Promise<Object> {
    if (! await this.productsExistAndAreValid( data["products"]))
      return { error: "Products data are invalid!" }
    try {
      await this.makeSale( data);
      return {};
    } catch (error) {
      return { error };
    }
  }

  async find() {
    return await this.manager.createQueryBuilder( Sale, "sales").
      leftJoinAndSelect( "sales.orders", "orders").
      leftJoinAndSelect( "orders.product_id", "products").
      getMany();
  }

  async findOne( id: number) {
    return await this.manager.createQueryBuilder( Sale, "sales"). 
      where( "id = :id").
      setParameters( { id }).
      leftJoinAndSelect( "sales.orders", "orders").
      leftJoinAndSelect( "orders.product_id", "products").
      getOne();
  }

  async delete( id: number) {
    const sale = await this.getFullyJoinedSale( id);
    if (! sale)
      return null;
    return await this.makeDeleteTransaction( sale);
  }

  async update( id: number, data: Object) {
    if (! await this.productsExistAndAreValid( data["products"]))
      return { error: "Products data are invalid!" }
    const sale = await this.getFullyJoinedSale( id);
    if (! sale)
      return null;
    try {
      return await this.modifySale( sale, data);
    } catch (error) {
      return { error };
    }
  }

  @Transaction()
  private async makeDeleteTransaction( sale: Sale, 
    @TransactionManager() manager?: EntityManager) {
    await this.revertOrdersRecordsFrom( sale, manager);
    return await manager.delete( Sale, sale.id);
  }

  @Transaction()
  private async modifySale( sale: Sale, data: Object,
    @TransactionManager() manager?: EntityManager) {
    await this.revertOrdersRecordsFrom( sale, manager);
    await this.makeOrderRecords( data["products"], sale.id, manager);
    const sale_price = await this.getTotalValue( sale, manager)["sum"];
    const customer_cpf = data["customer_cpf"];
    return await manager.update( Sale, sale.id, 
      { sale_price, customer_cpf });
  }

  @Transaction()
  private async makeSale( data: Object, 
    @TransactionManager() manager?: EntityManager) {
    const sale = await this.makeSaleRecord( data, manager);
    await this.makeOrderRecords( data["products"], sale.id, manager);
    await this.setTotalValue( sale, manager);
  }

  private async makeSaleRecord( data: Object, 
    manager: EntityManager = this.manager) : Promise<Sale> {
    const sale = manager.create( Sale, data);
    return await manager.save( sale);
  }

  private async revertOrdersRecordsFrom( sale: Sale, 
    manager?: EntityManager) {
    const productRepository = getCustomRepository( ProductRepository);
    const orderRepository = getCustomRepository( OrderRepository);
    for (const order of sale.orders) {
      await productRepository.changeQuantity( order.product_id['id'], 
        order.quantity, manager);
      await orderRepository.delete( order.id, manager);
    }
  }

  private async makeOrderRecords( products_data: Object[], 
    sale_id: number, manager: EntityManager = this.manager) {
    const orderRepository = getCustomRepository( OrderRepository);
    return await orderRepository.createOrdersAndUpdateProducts(
      products_data, sale_id, manager);
  }

  private getFullyJoinedSale( id: number) {
    return this.manager.createQueryBuilder( Sale, "sales").
      innerJoinAndSelect( "sales.orders", "orders").
      innerJoinAndSelect( "orders.product_id", "products").
      where( "sales.id = :id").
      setParameters( { id }).
      getOne()
  }

  private async setTotalValue( sale: Sale, 
    manager: EntityManager = this.manager) {
    const total_value = await this.getTotalValue( sale, manager);
    await manager.update( Sale, sale, { 'sale_price': total_value.sum });
  }

  private async getTotalValue( sale: Sale, 
    manager: EntityManager = this.manager) {
    return await manager.createQueryBuilder( Order, "orders")
      .select( "SUM( orders.quantity * products.price)")
      .innerJoin( "orders.sale_id", "sales")
      .innerJoin( "orders.product_id", "products")
      .where( "sales.id = :sale_id")
      .setParameter( 'sale_id', sale.id)
      .getRawOne()
  }

  private async productsExistAndAreValid( products_data: Object[]) {
    return this.hasProducts( products_data) && await getCustomRepository(
      ProductRepository).productsOrdersAreValid( products_data);
  }

  private hasProducts( products: any) {
    try {
      return products.length > 0;
    } catch {
      return false;
    }
  }
}