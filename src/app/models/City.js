import Sequelize, { Model } from 'sequelize';

class City extends Model {
  static init(sequelize) {
    super.init(
      {
        city: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.State, { foreignKey: 'state_id', as: 'state' });
  }
}

export default City;
