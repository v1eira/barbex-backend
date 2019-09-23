import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Image from '../app/models/Image';
import Barbershop from '../app/models/Barbershop';
import Operation from '../app/models/Operation';

import databaseConfig from '../config/database';

const models = [User, Image, Barbershop, Operation];

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
