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
import BarberController from './app/controllers/BarberController';
import BarbershopServiceController from './app/controllers/BarbershopServiceController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import AvailableController from './app/controllers/AvailableController';

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

routes.get('/users/addresseslists', UsersAddressListController.index);
routes.post('/users/addresseslists', UsersAddressListController.store);
routes.put('/users/addresseslists/:id', UsersAddressListController.update);

routes.post('/barbershops', BarbershopController.store);
routes.get('/barbershops', BarbershopController.index);
routes.get('/barbershops/:id', BarbershopController.one);
routes.put('/barbershops/:id', BarbershopController.update);
routes.delete('/barbershops/:id', BarbershopController.delete);

routes.get('/barbershops/:barbershopId/operations', OperationController.index);
routes.post('/barbershops/:barbershopId/operations', OperationController.store);
routes.put(
  '/barbershops/:barbershopId/operations/:id',
  OperationController.update
);
routes.delete(
  '/barbershops/:barbershopId/operations/:id',
  OperationController.delete
);

routes.get('/favorites', FavoriteController.index);
routes.post('/favorites', FavoriteController.store);
routes.delete('/favorites/:id', FavoriteController.delete);

routes.get('/users/ratings/:id', RatingController.show);
routes.get('/ratings/:barbershopId', RatingController.index);
routes.post('/ratings', RatingController.store);

routes.post('/barbershops/:barbershopId/barbers', BarberController.store);
routes.get('/barbershops/:barbershopId/barbers', BarberController.index);
routes.delete(
  '/barbershops/:barbershopId/barbers/:barberId',
  BarberController.delete
);

routes.get(
  '/barbershops/:barbershopId/services',
  BarbershopServiceController.index
);
routes.post(
  '/barbershops/:barbershopId/services',
  BarbershopServiceController.store
);
routes.put(
  '/barbershops/:barbershopId/services/:serviceId',
  BarbershopServiceController.update
);
routes.delete(
  '/barbershops/:barbershopId/services/:serviceId',
  BarbershopServiceController.delete
);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get(
  '/barbershops/:barbershopId/barbers/:barberId/available',
  AvailableController.index
);

export default routes;
