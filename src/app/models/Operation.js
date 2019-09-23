import Sequelize, { Model } from 'sequelize';

class Operation extends Model {
  static init(sequelize) {
    super.init(
      {
        weekday: Sequelize.STRING,
        opening_hour: Sequelize.TIME,
        closing_hour: Sequelize.TIME,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.BarberShop, {
      foreignKey: 'barbershop_id',
      as: 'barbershop',
    });
  }
}

export default Operation;
