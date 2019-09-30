import { Model, Sequelize } from 'sequelize';

class UsersAddressList extends Model {
  static init(sequelize) {
    super.init(
      {
        main: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Address, {
      foreignKey: 'address_id',
      as: 'address',
      targetKey: 'id',
    });
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      targetKey: 'id',
    });
  }
}

export default UsersAddressList;
