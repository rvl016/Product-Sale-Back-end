import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

import ProductRepository from '../repository/product'

export default class ProductController {


  static repository() {
    return getCustomRepository( ProductRepository);
  }

  static async getProducts( req: Request, res: Response) : Promise<Response> {
    const repository = ProductController.repository()
    const products = await repository.find();
    return res.json( products);
  }

  static async getProduct( req: Request, res: Response) : Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.findOne( +req.params.id);
    return ProductController.handlePresence( JSON.stringify( results), res);
  }

  static async createProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.createAndSave( req.body);
    return res.json( results);
  }

  static async updateProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.update( +req.params.id, req.body);
    return ProductController.handlePresence( JSON.stringify( results), res);
  };

  static async deleteProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.delete( +req.params.id);
    return res.json( results);
  };

  static handlePresence( results: Object, res: Response) {
    if (results) 
      return res.json( results);
    res.statusCode = 204;
    return res.json();
  }
}