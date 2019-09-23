import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Image from '../app/models/Image';
import BarberShop from '../app/models/BarberShop';
import Operation from '../app/models/Operation';

import databaseConfig from '../config/database';

const models = [User, Image, BarberShop, Operation];

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
