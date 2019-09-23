import Sequelize, { Model } from 'sequelize';

class Barbershop extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        address: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.Operation, {
      foreignKey: 'barbershop_id',
      sourceKey: 'id',
    });
  }
}

export default Barbershop;
