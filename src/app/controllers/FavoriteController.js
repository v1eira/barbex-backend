import Barbershop from '../models/Barbershop';

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
        },
      ],
    });

    return res.json(favorites);
  }

  async store(req, res) {
    const barbershopExists = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const checkFavoriteExists = await Favorite.findOne({
      where: { user_id: req.userId, barbershop_id: req.params.barbershopId },
    });

    if (checkFavoriteExists) {
      return res
        .status(400)
        .json({ error: 'Barbershop already exists in users favorites.' });
    }

    const { id } = await Favorite.create({
      user_id: req.userId,
      barbershop_id: req.params.barbershopId,
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
