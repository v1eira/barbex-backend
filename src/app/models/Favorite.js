import { Model } from 'sequelize';

class Favorite extends Model {
  static init(sequelize) {
    super.init(
      {},
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

export default Favorite;
