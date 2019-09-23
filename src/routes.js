import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import NotificationController from './app/controllers/NotificationController';
import ImageController from './app/controllers/ImageController';
import OperationController from './app/controllers/OperationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/images', upload.single('file'), ImageController.store);

routes.get('/:barbershopId/operation', OperationController.index);
routes.post('/:barbershopId/operation', OperationController.store);
routes.put('/:barbershopId/operation/:id', OperationController.update);
routes.delete('/:barbershopId/operation/:id', OperationController.delete);

export default routes;
