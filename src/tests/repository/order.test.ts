import { getManager, getCustomRepository, getConnection } from 'typeorm';

import { connectToDatabase } from "../../utils/connect_database";

import ProductRepository from "../../repository/product";
import OrderRepository from "../../repository/order";

import Order from "../../entity/order";

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

const products = [product1, product2, product3, product4];

async function createProducts() {
  const productRepository = getCustomRepository( ProductRepository);
  for (const product of products) {
    await productRepository.createAndSave( product);
  }
}

// How to test a method with pessimistic lock?
xdescribe( "SaleRepository createAndSave related", () => {
  test( "Create valid order works", async () => {
    const orderRepository = getCustomRepository( OrderRepository);
    const manager = getManager();
    const data = [{
      code: product1.code,
      quantity: 1
    }, {
      code: product2.code,
      quantity: 3
    }];
    await orderRepository.createOrdersAndUpdateProducts( data, 1, manager);
    const orders = await manager.createQueryBuilder( 
      Order, "orders").getMany();
    expect( orders).toHaveLength( 2);
  });

  test( "Create valid order produce the expected side effects", async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const orderRepository = getCustomRepository( OrderRepository);
    const manager = getManager();
    const data = [{
      code: product1.code,
      quantity: 1
    }, {
      code: product2.code,
      quantity: 3
    }];
    console.log( await productRepository.find());
    await orderRepository.createOrdersAndUpdateProducts( data, 1, manager);
    console.log( await productRepository.find());
    const changed_products = await productRepository.findManyByCode(
      [product1.code, product2.code]);
    expect( changed_products).toHaveLength( 2);
    expect( changed_products[0].quantity).toBe( product1.quantity - 1);
    expect( changed_products[1].quantity).toBe( product2.quantity - 3);
  });
});