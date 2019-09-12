import Sequelize, { Model } from 'sequelize';

class Schedule extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(/* models */) {}
}

export default Schedule;
