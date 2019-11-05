import * as Yup from 'yup';

import Barbershop from '../models/Barbershop';
import Image from '../models/Image';

import Favorite from '../models/Favorite';

class FavoriteController {
  async index(req, res) {
    const favorites = await Favorite.findAll({
      where: { user_id: req.userId },
      attributes: ['id'],
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
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

    return res.json(favorite);
  }

  async delete(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid favorite id' });
    }

    const favorite = await Favorite.findByPk(req.params.id);

    if (!favorite) {
      return res.status(400).json({ error: 'Favorite does not exists.' });
    }

    if (req.userId !== favorite.user_id) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the favorite.' });
    }

    await favorite.destroy();

    return res.send();
  }
}

export default new FavoriteController();
