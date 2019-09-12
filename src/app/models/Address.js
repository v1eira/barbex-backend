import Sequelize, { Model } from 'sequelize';

class Barber extends Model {
  static init(sequelize) {
    super.init(
      {
        street: Sequelize.STRING,
        number: Sequelize.STRING(10),
        city: Sequelize.STRING,
        sate: Sequelize.STRING(2),
        country: Sequelize.STRING(2),
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(/* models */) {}
}

export default Barber;
