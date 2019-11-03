/* eslint-disable prefer-template */
import {
  fromUnixTime,
  getISODay,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import Barbershop from '../models/Barbershop';
import Operation from '../models/Operation';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const searchDate = Number(date);
    const searchDateWithoutMiliseconds = Math.floor(searchDate / 1000);
    const parsedDate = fromUnixTime(searchDateWithoutMiliseconds);

    const dayOfTheWeek = getISODay(parsedDate);
    let weekday = '';

    if (dayOfTheWeek === 1) {
      weekday = 'segunda-feira';
    } else if (dayOfTheWeek === 2) {
      weekday = 'terça-feira';
    } else if (dayOfTheWeek === 3) {
      weekday = 'quarta-feira';
    } else if (dayOfTheWeek === 4) {
      weekday = 'quinta-feira';
    } else if (dayOfTheWeek === 5) {
      weekday = 'sexta-feira';
    } else if (dayOfTheWeek === 6) {
      weekday = 'sábado';
    } else if (dayOfTheWeek === 7) {
      weekday = 'domingo';
    }

    const operation = await Operation.findOne({
      where: { weekday, barbershop_id: barbershop.id },
    });

    if (!operation) {
      return res
        .status(400)
        .json({ error: 'Barbershop does not open on the required date' });
    }

    const appointments = await Appointment.findAll({
      where: {
        barber_id: req.params.barberId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    let opHour = Number(operation.opening_hour.slice(0, 2)); // 8
    const clHour = Number(operation.closing_hour.slice(0, 2)); // 18

    let initHour = operation.opening_hour.slice(0, 5); // '08:00'

    // Create full schedule

    const schedule = [];
    schedule.push(initHour);
    initHour = initHour.replace(':00', ':30');
    schedule.push(initHour);
    initHour = initHour.replace(':30', ':00');

    while (opHour < clHour - 1) {
      if (opHour < 9) {
        initHour = initHour.replace(
          '0' + String(opHour) + ':',
          '0' + String(opHour + 1) + ':'
        );
      } else if (opHour === 9) {
        initHour = initHour.replace('09:', '10:');
      } else {
        initHour = initHour.replace(
          String(opHour) + ':',
          String(opHour + 1) + ':'
        );
      }

      schedule.push(initHour);

      initHour = initHour.replace(':00', ':30');
      schedule.push(initHour);
      initHour = initHour.replace(':30', ':00');

      opHour += 1;
    }

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
