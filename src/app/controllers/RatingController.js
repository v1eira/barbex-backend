import * as Yup from 'yup';

import User from '../models/User';
import Image from '../models/Image';
import Barbershop from '../models/Barbershop';

import Rating from '../models/Rating';

class RatingController {
  async show(req, res) {
    const rating = await Rating.findByPk(req.params.id);

    if (!rating) {
      return res.status(400).json({ error: 'Rating does not exists.' });
    }

    if (rating.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the rating.' });
    }

    return res.json(rating);
  }

  async index(req, res) {
    const checkBarbershopExists = await Barbershop.findByPk(
      req.params.barbershopId
    );

    if (!checkBarbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const ratings = await Rating.findAll({
      where: { barbershop_id: req.params.barbershopId },
      attributes: ['id', 'grade', 'comment', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
          include: [
            {
              model: Image,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json(ratings);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      barbershop_id: Yup.number()
        .integer()
        .required(),
      grade: Yup.number()
        .integer()
        .positive()
        .min(1)
        .max(5)
        .required(),
      comment: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const barbershopExists = await Barbershop.findByPk(req.body.barbershop_id);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    let rating = null;

    if (req.body.comment) {
      rating = await Rating.create({
        user_id: req.userId,
        barbershop_id: req.body.barbershop_id,
        grade: req.body.grade,
        comment: req.body.comment,
      });
    } else {
      rating = await Rating.create({
        user_id: req.userId,
        barbershop_id: req.body.barbershop_id,
        grade: req.body.grade,
      });
    }

    const numberOfGrades = await Rating.count({
      where: { barbershop_id: req.body.barbershop_id },
    });

    const sumOfGrades = await Rating.sum('grade', {
      where: { barbershop_id: req.body.barbershop_id },
    });

    const barbershopGrade = sumOfGrades / numberOfGrades;

    const roundGrade = parseFloat(barbershopGrade.toFixed(1));

    await barbershopExists.update({ grade: roundGrade });

    return res.json(rating);
  }
}

export default new RatingController();
