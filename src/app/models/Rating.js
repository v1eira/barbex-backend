import Sequelize, { Model } from 'sequelize';

class Rating extends Model {
  static init(sequelize) {
    super.init(
      {
        stars: {
          type: Sequelize.ENUM,
          values: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(/* models */) {}
}

export default Rating;
