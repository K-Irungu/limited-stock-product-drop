import { Router } from 'express';
import * as productController from './product.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from './product.schema';

const router = Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/stock', productController.getProductStock);
router.post('/', validate(createProductSchema), productController.createProduct);
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
