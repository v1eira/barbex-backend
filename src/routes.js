import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import NotificationController from './app/controllers/NotificationController';
import ImageController from './app/controllers/ImageController';
import BarbershopController from './app/controllers/BarbershopController';
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

routes.post('/barbershops', BarbershopController.store);
routes.get('/barbershops', BarbershopController.index);
routes.put('/barbershops/:id', BarbershopController.update);

routes.get('/operations/:barbershopId', OperationController.index);
routes.post('/operations', OperationController.store);
routes.put('/operations/:id', OperationController.update);
routes.delete('/operations/:id', OperationController.delete);

export default routes;
