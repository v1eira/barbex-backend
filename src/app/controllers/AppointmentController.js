import * as Yup from 'yup';
import {
  startOfMinute,
  parseISO,
  isBefore,
  format,
  subHours,
  getISODay,
  getHours,
} from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Barbershop from '../models/Barbershop';
import Barber from '../models/Barber';
import BarbershopService from '../models/BarbershopService';
import Service from '../models/Service';
import Operation from '../models/Operation';
import Image from '../models/Image';
import Appointment from '../models/Appointment';
import Address from '../models/Address';
import City from '../models/City';
import State from '../models/State';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: [['date', 'DESC']],
      attributes: { exclude: ['user_id', 'barber_id', 'barbershop_id'] },
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Barber,
          as: 'barber',
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: Image,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
          ],
        },
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name'],
          include: [
            {
              model: Address,
              as: 'address',
              attributes: { exclude: ['city_id', 'createdAt', 'updatedAt'] },
              include: [
                {
                  model: City,
                  as: 'city',
                  attributes: ['id', 'city'],
                  include: [
                    {
                      model: State,
                      as: 'state',
                      attributes: ['id', 'state'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      barber_id: Yup.number().required(),
      barbershop_service_id: Yup.number().required(),
      barbershop_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check if barbershop exists
    const barbershop = await Barbershop.findByPk(req.body.barbershop_id);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    // Check if barber exists
    const barber = await Barber.findByPk(req.body.barber_id, {
      attributes: ['id', 'barbershop_id'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'barber'],
          include: [
            {
              model: Image,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    if (!barber) {
      return res.status(400).json({ error: 'Barber does not exists.' });
    }

    if (barber.barbershop_id !== barbershop.id) {
      return res
        .status(400)
        .json({ error: 'Barber does not belong to the barbershop.' });
    }

    // Check if Barbershop service exists
    const barbershopService = await BarbershopService.findByPk(
      req.body.barbershop_service_id,
      {
        include: [
          {
            model: Service,
            attributes: ['id', 'name'],
          },
        ],
      }
    );

    if (!barbershopService) {
      return res.status(400).json({ error: 'Service does not exists.' });
    }

    if (barbershopService.barbershop_id !== barbershop.id) {
      return res
        .status(400)
        .json({ error: 'Service does not belong to this barbershop.' });
    }

    // Check for past dates

    const { date } = req.body;

    const minuteStart = startOfMinute(parseISO(date));

    if (isBefore(minuteStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    // Check date availability

    const { barber_id, barbershop_id } = req.body;

    const dayOfTheWeek = getISODay(minuteStart);
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
      where: { weekday, barbershop_id },
    });

    if (!operation) {
      return res
        .status(400)
        .json({ error: 'Barbershop does not open on the required date' });
    }

    // Verify if req.body.date time is between opening and closing hour of operation
    const opHour = Number(operation.opening_hour.slice(0, 2));
    const clHour = Number(operation.closing_hour.slice(0, 2));
    const dateHour = getHours(minuteStart) + 2; // IDK why getHours is returning 2 hours less than expected

    if (dateHour < opHour) {
      return res.status(400).json({
        error: 'Appointment time is earlier than barbershop opening hour.',
      });
    }
    if (dateHour > clHour) {
      return res.status(400).json({
        error: 'Appointment time is later than barbershop closing hour.',
      });
    }
    if (dateHour === clHour) {
      return res
        .status(400)
        .json({ error: 'Appointment time is when the barbershop closes.' });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        date: minuteStart,
        barber_id,
        barbershop_id,
        canceled_at: null,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    // Create appointment
    const { id } = await Appointment.create({
      date: minuteStart,
      user_id: req.userId,
      barber_id,
      service: barbershopService.Service.name,
      price: barbershopService.price,
      barbershop_id,
    });

    const appointment = await Appointment.findByPk(id, {
      attributes: { exclude: ['user_id', 'barber_id', 'barbershop_id'] },
      include: [
        {
          model: Barber,
          as: 'barber',
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: Image,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
          ],
        },
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name'],
          include: [
            {
              model: Address,
              as: 'address',
              attributes: { exclude: ['city_id', 'createdAt', 'updatedAt'] },
              include: [
                {
                  model: City,
                  as: 'city',
                  attributes: ['id', 'city'],
                  include: [
                    {
                      model: State,
                      as: 'state',
                      attributes: ['id', 'state'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Notify appointment barber
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      minuteStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: barber.user.id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!appointment) {
      return res.status(400).json({ error: 'Appointment does not exists.' });
    }

    if (appointment.canceled_at !== null) {
      return res
        .status(400)
        .json({ error: 'Appointment is already canceled.' });
    }

    if (req.userId !== appointment.user.id) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment",
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointments 2 hours in advance' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.send();
  }
}

export default new AppointmentController();
