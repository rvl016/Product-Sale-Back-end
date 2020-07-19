import { Router } from "express";

import ProductController from "../controllers/product";

const router = Router();

router.get( "/products", ProductController.getProducts);
router.get( "/products/:id", ProductController.getProduct);
router.post( "/products", ProductController.createProduct);
router.put( "/products/:id", ProductController.updateProduct);
router.delete( "/products/:id", ProductController.deleteProduct);

export default router;