import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

import ProductRepository from '../repository/product';

import { handlePresence, handleErrors } from '../helpers/response_helpers';

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
    return handlePresence( JSON.stringify( results), res);
  }

  static async createProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.createAndSave( req.body);
    return handleErrors( res.json( results), res, 201);
  }

  static async updateProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.update( +req.params.id, req.body);
    return handlePresence( JSON.stringify( results), res);
  };

  static async deleteProduct( req: Request, res: Response): Promise<Response> {
    const repository = ProductController.repository()
    const results = await repository.delete( +req.params.id);
    return handlePresence( JSON.stringify( results), res);
  };
}