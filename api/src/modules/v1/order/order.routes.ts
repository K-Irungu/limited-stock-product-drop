import { Router } from 'express';
import * as orderController from './order.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { createOrderSchema } from './order.schema';

const router = Router();

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;
