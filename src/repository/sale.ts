import { EntityRepository, AbstractRepository, Transaction, TransactionManager, getCustomRepository } from "typeorm";
import Sale from "../entity/sale";
import Order from "../entity/order";
import Product from "../repository/product";
import ProductRepository from "../repository/product";
import OrderRepository from "./order";

@EntityRepository( Sale)
export default class SaleRepository extends AbstractRepository<Sale> {
  
  async createAndSave( data: Object) : Promise<Object> {
    if (! this.productsExistAndAreValid( data["products"]))
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
      getMany();
  }

  async findOne( id: number) {
    return await this.manager.findOne( Sale, id);
  }

  async delete( id: number) {
    const sale = await this.manager.findOne( Sale, id);
    if (! sale)
      return null;
    const orders = sale.orders;
    await this.revertOrdersRecordsFrom( sale);
    return await this.manager.delete( Sale, sale.id);
  }

  async update( id: number, data: Object) {
    if (! this.productsExistAndAreValid( data["products"]))
      return { error: "Products data are invalid!" }
    const sale = await this.manager.findOne( Sale, id);
    if (! sale)
      return null;
    try {
      return await this.modifySale( id, data, sale);
    } catch (error) {
      return { error };
    }
  }

  @Transaction()
  private async modifySale( id: number, data: Object, sale: Sale) {
    await this.revertOrdersRecordsFrom( sale);
    await this.makeOrderRecords( data["products"], id);
    this.manager.merge( Sale, sale, data);
    return await this.manager.save( sale);
  }

  @Transaction()
  private async makeSale( data: Object) {
    const sale = await this.makeSaleRecord( data);
    await this.makeOrderRecords( data["products"], sale.id);
    await this.setTotalValue( sale);
  }

  private async makeSaleRecord( data: Object) : Promise<Sale> {
    const sale = this.manager.create( Sale, data);
    return await this.manager.save( sale);
  }

  private async revertOrdersRecordsFrom( sale: Sale) {
    const productRepository = getCustomRepository( ProductRepository);
    const orderRepository = getCustomRepository( OrderRepository);
    sale.orders.forEach( async order => {
      productRepository.changeQuantity( order.product_id, order.quantity);
      await orderRepository.delete( order.id);
    });
  }

  private async makeOrderRecords( products_data: Object[], sale_id: number) {
    const orderRepository = getCustomRepository( OrderRepository);
    return await orderRepository.createOrdersAndUpdateProducts(
      products_data, sale_id);
  }

  private async setTotalValue( sale: Sale) {
    const total_value = await this.manager.createQueryBuilder( Order, "orders")
      .select( "SUM( orders.quantity * products.price)")
      .innerJoin( "orders.sale_id", "sales")
      .innerJoin( "orders.product_id", "products")
      .where( "sales.id = :sale_id")
      .setParameter( 'sale_id', sale.id)
      .getRawOne()
    sale.sale_price = total_value;
    this.manager.save( Sale, sale);
  }

  // Can't make this work out 
  private async getSaleProducts( sale: Sale) : Promise<Product[]> {
    return this.manager.createQueryBuilder( Product, "products").
      setLock( "pessimistic_write").
      innerJoinAndSelect( "orders.product_id", "products").
      where( "orders.sale_id = :sale_id").
      setParameters( { sale_id: sale.id }).
      getMany();
  }

  private async productsExistAndAreValid( products_data: Object[]) {
    if (this.hasNoProducts( products_data) 
      || ! await this.productsAreValid( products_data))
      return false;
    return true;
  }

  private async productsAreValid( products_dict: Object[]) {
    const productRepository = new ProductRepository();
    const db_products = await productRepository.find();
    const db_product_codes = db_products.map( product => product.code);
    return products_dict.map( product => product['code']).some( product => {
      db_product_codes.find( code => code == product);
    });
  }

  private hasNoProducts( products: any) {
    try {
      return products.length > 0;
    } catch {
      return false;
    }
  }
}