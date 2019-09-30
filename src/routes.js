import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import NotificationController from './app/controllers/NotificationController';
import ImageController from './app/controllers/ImageController';
import BarbershopController from './app/controllers/BarbershopController';
import OperationController from './app/controllers/OperationController';
import FullAddressController from './app/controllers/FullAddressController';
import UsersAddressListController from './app/controllers/UsersAddressListController';
import FavoriteController from './app/controllers/FavoriteController';
import RatingController from './app/controllers/RatingController';

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

routes.post('/addresses', FullAddressController.store);
routes.delete('/addresses/:id', FullAddressController.delete);
routes.put('/addresses/:id', FullAddressController.update);

routes.get('/addresseslists', UsersAddressListController.index);
routes.post('/addresseslists', UsersAddressListController.store);
routes.put('/addresseslists/:id', UsersAddressListController.update);

routes.post('/barbershops', BarbershopController.store);
routes.get('/barbershops', BarbershopController.index);
routes.put('/barbershops/:id', BarbershopController.update);

routes.get('/operations/:barbershopId', OperationController.index);
routes.post('/operations', OperationController.store);
routes.put('/operations/:id', OperationController.update);
routes.delete('/operations/:id', OperationController.delete);

routes.get('/favorites', FavoriteController.index);
routes.post('/favorites', FavoriteController.store);
routes.delete('/favorites/:id', FavoriteController.delete);

routes.get('/ratings/:id', RatingController.show);
routes.get('/ratings/:id', RatingController.index);
routes.post('/ratings', RatingController.store);

export default routes;
