import { getManager, getCustomRepository, getConnection } from 'typeorm';

import { connectToDatabase } from "../../utils/connect_database";
import ProductRepository from "../../repository/product";

import Product from "../../entity/product";

beforeEach( async () => {
  await connectToDatabase();
});

afterEach( async () => {
  await getConnection().close()
});

describe( "ProductRepository createAndSave related", () => {
  test( "Create valid product works", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    const error = await productRepository.createAndSave( data);
    expect( Object.keys( error) ).toHaveLength( 0);
    const manager = getManager();
    const product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    expect( product).toBeDefined();
    expect( product.is_active).toBe( true);
    expect( product.quantity).toBe( 2);
    expect( product.code).toBe( "1010101010");
    expect( product.price).toBeCloseTo( 10.5);
  });

  test( "Create invalid product (code) rejected", async () => {
    const data = {
      name: "x Product",
      code: "101b10101b",
      price: 10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    const error : Object = await productRepository.createAndSave( data);
    expect( Object.keys( error)).toContain( 'error');
  });

  test( "Create invalid product (price) rejected", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: -10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    const error : Object = await productRepository.createAndSave( data);
    expect( Object.keys( error)).toContain( 'error');
  });

  test( "Create invalid product (quantity) rejected", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: -1
    };
    const productRepository = getCustomRepository( ProductRepository);
    const error : Object = await productRepository.createAndSave( data);
    expect( Object.keys( error)).toContain( 'error');
  });
});


describe( "ProductRepository update related", () => {
  test( "Update product works", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 1
    };
    const productRepository = getCustomRepository( ProductRepository);
    await productRepository.createAndSave( data);
    const manager = getManager();
    const old_product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    const error = await productRepository.update( 
      old_product.id, { price: 100.0 });
    expect( Object.keys( error) ).toHaveLength( 0);
    const product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    expect( product).toBeDefined();
    expect( product.code).toBe( "1010101010");
    expect( product.price).toBeCloseTo( 100);
  });

  test( "Update inactive product rejected", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 1,
      is_active: false
    };
    const productRepository = getCustomRepository( ProductRepository);
    await productRepository.createAndSave( data);
    const manager = getManager();
    const product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    const error = await productRepository.update( 
      product.id, { price: 100.0 });
    expect( error).toBe( null);
  });

  test( "Update inexistent product rejected", async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const error = await productRepository.update( 100, { price: 100.0 });
    expect( error).toBe( null);
  });
});

describe( "ProductRepository find related", () => {
  test( "Find product works", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    const manager = getManager();
    await productRepository.createAndSave( data);
    const product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    const result = await productRepository.findOne( product.id);
    expect( Object( result)).toMatchObject( data);
  });

  test( "Find inactive product rejected", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 2,
      is_active: false
    };
    const productRepository = getCustomRepository( ProductRepository);
    const manager = getManager();
    await productRepository.createAndSave( data);
    const product = await manager.createQueryBuilder( Product, "products")
      .getOne();
    const result = await productRepository.findOne( product.id);
    expect( result).toBe( null);
  });

  test( "Find inexistent product rejected", async () => {
    const productRepository = getCustomRepository( ProductRepository);
    const result = await productRepository.findOne( 100);
    expect( result).toBeUndefined();
  });
  
  test( "Find all products works", async () => {
    const data1 = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 2
    };
    const data2 = {
      name: "x Product",
      code: "1010111010",
      price: 10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    await productRepository.createAndSave( data1);
    await productRepository.createAndSave( data2);
    const result = await productRepository.find();
    expect( result).toHaveLength( 2);
  });
});

describe( "ProductRepository delete related", () => {
  test( "Delete product works", async () => {
    const data = {
      name: "x Product",
      code: "1010101010",
      price: 10.50,
      quantity: 2
    };
    const productRepository = getCustomRepository( ProductRepository);
    await productRepository.createAndSave( data);
    const products = await productRepository.find();
    await productRepository.delete( products[0].id);
    const result = await productRepository.find();
    expect( result).toHaveLength( 0);
  });
});





