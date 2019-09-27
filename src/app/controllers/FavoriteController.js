import * as Yup from 'yup';

import User from '../models/User';
import Barbershop from '../models/Barbershop';

import Favorite from '../models/Favorite';

class FavoriteController {
  async index(req, res) {
    const checkUserExists = await User.findByPk(req.userId);

    if (!checkUserExists) {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const favorites = await Favorite.findAll({
      where: { user_id: req.userId },
      attributes: ['id'],
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    return res.json(favorites);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      barbershop_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findByPk(req.userId);

    if (!userExists) {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const barbershopExists = await Barbershop.findByPk(req.body.barbershop_id);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const checkFavoriteExists = await Favorite.findOne({
      where: { user_id: req.userId, barbershop_id: req.body.barbershop_id },
    });

    if (checkFavoriteExists) {
      return res
        .status(400)
        .json({ error: 'Barbershop already exists in users favorites.' });
    }

    const { id } = await Favorite.create({
      user_id: req.userId,
      barbershop_id: req.body.barbershop_id,
    });

    const favorite = await Favorite.findByPk(id, {
      attributes: ['id'],
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    return res.json(favorite);
  }

  async delete(req, res) {
    const favorite = await Favorite.findByPk(req.params.id);

    if (!favorite) {
      return res.status(400).json({ error: 'Favorite does not exists.' });
    }

    const { user_id } = favorite;

    if (user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the favorite.' });
    }

    await favorite.destroy();

    return res.send();
  }
}

export default new FavoriteController();
