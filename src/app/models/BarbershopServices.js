import { Model, Sequelize } from 'sequelize';

class BarbershopServices extends Model {
  static init(sequelize) {
    super.init(
      {
        grade: Sequelize.FLOAT(10, 2),
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
    this.belongsTo(models.Services, {
      foreignKey: 'service_id',
      targetKey: 'id',
    });
  }
}

export default BarbershopServices;
