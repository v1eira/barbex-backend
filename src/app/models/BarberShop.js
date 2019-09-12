import Sequelize, { Model } from 'sequelize';

class BarberShop extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(/* models */) {}
}

export default BarberShop;
