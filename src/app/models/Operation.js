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
    this.belongsTo(models.Barbershop, {
      foreignKey: 'barbershop_id',
      as: 'barbershop',
      targetKey: 'id',
    });
  }
}

export default Operation;
