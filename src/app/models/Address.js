import Sequelize, { Model } from 'sequelize';

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        street: Sequelize.STRING,
        number: Sequelize.STRING(10),
        complement: Sequelize.STRING,
        neighborhood: Sequelize.STRING,
        cep: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.City, { foreignKey: 'city_id', as: 'city' });
    this.hasMany(models.UsersAddressList, {
      foreignKey: 'address_id',
      sourceKey: 'id',
    });
  }
}

export default Address;
