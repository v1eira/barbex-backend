import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        service: Sequelize.STRING,
        price: Sequelize.FLOAT(10, 2),
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Rating, { foreignKey: 'rating_id', as: 'rating' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Barber, { foreignKey: 'barber_id', as: 'barber' });
    this.belongsTo(models.Barbershop, {
      foreignKey: 'barbershop_id',
      as: 'barbershop',
    });
  }
}

export default Appointment;
