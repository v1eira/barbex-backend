import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Image from '../app/models/Image';
import Barber from '../app/models/Barber';
import Barbershop from '../app/models/Barbershop';
import Operation from '../app/models/Operation';
import Favorite from '../app/models/Favorite';
import Rating from '../app/models/Rating';
import Service from '../app/models/Service';
import BarbershopService from '../app/models/BarbershopService';
import Appointment from '../app/models/Appointment';

import State from '../app/models/State';
import City from '../app/models/City';
import Address from '../app/models/Address';
import UsersAddressList from '../app/models/UsersAddressList';

import databaseConfig from '../config/database';

const models = [
  User,
  Image,
  Barber,
  Barbershop,
  Operation,
  Favorite,
  Rating,
  State,
  City,
  Address,
  UsersAddressList,
  Service,
  BarbershopService,
  Appointment,
];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

export default new Database();
