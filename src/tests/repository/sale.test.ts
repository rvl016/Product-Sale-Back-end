import { getManager, getCustomRepository, getConnection } from 'typeorm';

import { connectToDatabase } from "../../utils/connect_database";

import ProductRepository from "../../repository/product";
import OrderRepository from "../../repository/order";
import SaleRepository from "../../repository/sale";

import Product from "../../entity/product";
import Order from "../../entity/order";
import Sale from "../../entity/order";

beforeEach( async () => {
  await connectToDatabase();
  await createProducts();
});

afterEach( async () => {
  await getConnection().close()
});

const product1 = {
  name: "x Product",
  code: "1110101010",
  price: 10,
  quantity: 2
};

const product2 = {
  name: "y Product",
  code: "1210101010",
  price: 20,
  quantity: 4
};

const product3 = {
  name: "z Product",
  code: "1310101010",
  price: 30,
  quantity: 8
};

const product4 = {
  name: "w Product",
  code: "1410101010",
  price: 40,
  quantity: 16,
  is_active: false
};

const sale1 = {
  customer_cpf: "123456789-12",
  products: [{
    code: product1.code,
    quantity: 1
  }, {
    code: product2.code,
    quantity: 3
  }]
}

const sale2 = {
  customer_cpf: "123456789-12",
  products: [{
    code: product1.code,
    quantity: 1
  }, {
    code: product3.code,
    quantity: 3
  }]
}

const saleImpossible = {
  customer_cpf: "123456789-12",
  products: [{
    code: product1.code,
    quantity: 9999
  }, {
    code: product3.code,
    quantity: 3
  }]
}

const products = [product1, product2, product3, product4];

async function createProducts() {
  const productRepository = getCustomRepository( ProductRepository);
  for (const product of products) {
    await productRepository.createAndSave( product);
  }
}

describe( "SaleRepository createAndSave related", () => {
  test( "Create valid sale works", async () => {
    const saleRepository = getCustomRepository( SaleRepository);
    const manager = getManager();
    const data = sale1;
    const results = await saleRepository.createAndSave( data);
    expect( results).toStrictEqual( {});
    const orders = await manager.createQueryBuilder( 
      Order, "orders").getMany();
    expect( orders).toHaveLength( 2);
    const sales = await saleRepository.find();
    expect( sales).toHaveLength( 1);
  });

  test( "Create valid sale produce the expected side effects", async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const saleRepository = getCustomRepository( SaleRepository);
    const data = sale1;
    await saleRepository.createAndSave( data);
    const changed_products = await productRepository.findManyByCodeWithLock(
      [product1.code, product2.code]);
    expect( changed_products).toHaveLength( 2);
    expect( changed_products[0].quantity).toBe( product1.quantity - 1);
    expect( changed_products[1].quantity).toBe( product2.quantity - 3);
  });

  test( "Create sale with more products than in stock fails", async () => {
    const saleRepository = getCustomRepository( SaleRepository);
    const data = saleImpossible;
    const result = await saleRepository.createAndSave( data);
    expect( result).toHaveProperty( "error");
    const sale = await saleRepository.find();
    expect( sale).toHaveLength( 0);
  });

  test( "Create sale with more products than in stock produce no side effects",
    async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const saleRepository = getCustomRepository( SaleRepository);
    const data = saleImpossible;
    await saleRepository.createAndSave( data);
    const products = await productRepository.findManyByCodeWithLock(
      [product1.code, product2.code]);
    expect( products).toHaveLength( 2);
    expect( products[0].quantity).toBe( product1.quantity);
    expect( products[1].quantity).toBe( product2.quantity);
  });
});

describe( "OrderRepository delete works related", () => {
  test( "Delete sale works", async () => {
    const saleRepository = getCustomRepository( SaleRepository);
    const data = sale1;
    await saleRepository.createAndSave( data);
    const old_sales = await saleRepository.find();
    await saleRepository.delete( old_sales[0].id);
    const sales = await saleRepository.find();
    expect( sales).toHaveLength( 0);
  });

  test( "Delete sale produce the expected side effects", async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const saleRepository = getCustomRepository( SaleRepository);
    const data = sale1;
    await saleRepository.createAndSave( data);
    const old_sales = await saleRepository.find();
    await saleRepository.delete( old_sales[0].id);
    const changed_products = await productRepository.findManyByCodeWithLock(
      [product1.code, product2.code]);
    expect( changed_products).toHaveLength( 2);
    expect( changed_products[0].quantity).toBe( product1.quantity);
    expect( changed_products[1].quantity).toBe( product2.quantity);
  });
});