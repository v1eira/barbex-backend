import Sequelize, { Model } from 'sequelize';

class BarberShopCalendar extends Model {
  static init(sequelize) {
    super.init(
      {
        openingHour: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        closingHour: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        day: {
          type: Sequelize.ENUM,
          values: [0, 1, 2, 3, 4, 5, 6],
          allowNull: false,
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

export default BarberShopCalendar;
