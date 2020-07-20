import { getManager, getCustomRepository, getConnection } from 'typeorm';

import { connectToDatabase } from "../../utils/connect_database";

import ProductRepository from "../../repository/product";
import OrderRepository from "../../repository/order";

import Product from "../../entity/product";
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
  code: "1010101010",
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
  products.forEach( async product => {
    await productRepository.createAndSave( product);
  });
}

// How to test a method with pessimistic lock?
xdescribe( "OrderRepository createAndSave related", () => {
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
    const results = await orderRepository.
      createOrdersAndUpdateProducts( data, 1);
    expect( results).toBe( data);
    const orders = await manager.createQueryBuilder( 
      Order, "orders").getMany();
    expect( orders).toHaveLength( 2);
  });

  test( "Create valid order produce the expected side effects", async () => {
    const data = [{
      code: product1.code,
      quantity: 1
    }, {
      code: product2.code,
      quantity: 3
    }];
    const changed_products = await getConnection().transaction( 
      async entityManager => { 
      await entityManager.getCustomRepository( OrderRepository).
        createOrdersAndUpdateProducts( data, 1);
      return await entityManager.getCustomRepository( ProductRepository).
        findManyByCodeWithLock( [product1.code, product2.code]);
    });
    expect( changed_products[0].quantity).toBe( product1.quantity - 1);
    expect( changed_products[1].quantity).toBe( product2.quantity - 3);
  });
});