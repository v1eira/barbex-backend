import Sequelize, { Model } from 'sequelize';

class State extends Model {
  static init(sequelize) {
    super.init(
      {
        state: Sequelize.STRING(2),
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default State;
