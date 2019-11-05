import * as Yup from 'yup';

import Barber from '../models/Barber';

import User from '../models/User';
import Image from '../models/Image';
import Barbershop from '../models/Barbershop';

class BarberController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const barbershopExists = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const emailExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    if (barbershopExists.owner !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const newBarber = await User.create({
      ...req.body,
      barber: true,
    });

    const { id } = await Barber.create({
      user_id: newBarber.id,
      barbershop_id: req.params.barbershopId,
    });

    const barber = await Barber.findByPk(id, {
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
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(barber);
  }

  async index(req, res) {
    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const barbers = await Barber.findAll({
      attributes: ['id'],
      where: { barbershop_id: req.params.barbershopId },
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

    return res.json(barbers);
  }

  async delete(req, res) {
    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    if (!Number.isInteger(Number(req.params.barberId))) {
      return res.status(400).json({ error: 'Invalid barber id' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (barbershop.owner !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const barber = await Barber.findOne({
      where: {
        id: req.params.barberId,
        barbershop_id: req.params.barbershopId,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!barber) {
      return res.status(400).json({ error: 'Barber does not exists.' });
    }

    const user = await User.findByPk(barber.user.id);

    await user.destroy();

    return res.send();
  }
}

export default new BarberController();
