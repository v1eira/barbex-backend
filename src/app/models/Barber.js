import Sequelize, { Model } from 'sequelize';

class Barber extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        photo: Sequelize.STRING,
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
