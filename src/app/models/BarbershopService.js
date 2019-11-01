import Sequelize, { Model } from 'sequelize';

class BarbershopService extends Model {
  static init(sequelize) {
    super.init(
      {
        price: Sequelize.FLOAT(10, 2),
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
      targetKey: 'id',
    });
    this.belongsTo(models.Service, {
      foreignKey: 'service_id',
      targetKey: 'id',
    });
  }
}

export default BarbershopService;
