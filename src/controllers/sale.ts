import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

import SaleRepository from '../repository/sale'

import { handlePresence, handleErrors } from '../helpers/response_helpers';

export default class SaleController {
  
  static repository() {
    return getCustomRepository( SaleRepository);
  }

  static async getSales( req: Request, res: Response) : Promise<Response> {
    const repository = SaleController.repository()
    const sales = await repository.find();
    return res.json( sales);
  }

  static async getSale( req: Request, res: Response) : Promise<Response> {
    const repository = SaleController.repository()
    const results = await repository.findOne( +req.params.id);
    return handlePresence( JSON.stringify( results), res);
  }

  static async createSale( req: Request, res: Response): Promise<Response> {
    const repository = SaleController.repository()
    const results = await repository.createAndSave( req.body);
    return handleErrors( res.json( results), res, 201);
  }

  static async updateSale( req: Request, res: Response): Promise<Response> {
    const repository = SaleController.repository()
    const results = await repository.update( +req.params.id, req.body);
    return handlePresence( JSON.stringify( results), res);
  };

  static async deleteSale( req: Request, res: Response): Promise<Response> {
    const repository = SaleController.repository()
    const results = await repository.delete( +req.params.id);
    return handlePresence( JSON.stringify( results), res);
  };
}