import Sequelize, { Model } from 'sequelize';

class Barbershop extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cnpj: Sequelize.STRING,
        grade: Sequelize.FLOAT(1, 1),
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
    this.hasMany(models.Barber, {
      foreignKey: 'barbershop_id',
      sourceKey: 'id',
    });
    this.belongsTo(models.Address, { foreignKey: 'address_id', as: 'address' });
    this.belongsTo(models.User, { foreignKey: 'owner' });
  }
}

export default Barbershop;
