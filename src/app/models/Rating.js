import Sequelize, { Model } from 'sequelize';

class Rating extends Model {
  static init(sequelize) {
    super.init(
      {
        grade: Sequelize.FLOAT,
        comment: Sequelize.STRING,
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
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      targetKey: 'id',
    });
  }
}

export default Rating;
