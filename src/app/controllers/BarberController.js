import * as Yup from 'yup';

import Barber from '../models/Barber';

import User from '../models/User';
import Image from '../models/Image';
import Barbershop from '../models/Barbershop';

class BarberController {
  async store(req, res) {
    const schema = Yup.object().shape({
      user_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findByPk(req.body.user_id);

    if (!userExists) {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const userIsBarber = await Barber.findOne({
      where: { user_id: userExists.id },
    });

    if (userIsBarber) {
      return res.status(400).json({ error: 'User is already a barber.' });
    }

    const barbershopExists = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const { id } = await Barber.create({
      user_id: req.body.user_id,
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

  async index(req, res) {}
}

export default new BarberController();
