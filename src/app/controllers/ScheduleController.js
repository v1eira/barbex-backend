import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Barber from '../models/Barber';
import User from '../models/User';
import Image from '../models/Image';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const barber = await Barber.findOne({
      where: { user_id: req.userId },
    });

    if (!barber) {
      return res.status(401).json({ error: 'User is not a barber' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        barber_id: barber.id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: [
            {
              model: Image,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: ['date'],
    });

    return res.json({ appointments });
  }
}

export default new ScheduleController();
