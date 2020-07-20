import { Router } from "express";

import SaleController from "../controllers/sale";

const router = Router();

router.get( "/sales", SaleController.getSales);
router.get( "/sales/:id", SaleController.getSale);
router.post( "/sales", SaleController.createSale);
router.put( "/sales/:id", SaleController.updateSale);
router.delete( "/sales/:id", SaleController.deleteSale);

export default router;