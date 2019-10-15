import * as Yup from 'yup';
import { Op } from 'sequelize';
import Barbershop from '../models/Barbershop';

import User from '../models/User';

import Address from '../models/Address';
import City from '../models/City';
import State from '../models/State';

class BarbershopController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const barbershops = await Barbershop.findAll({
      attributes: ['id', 'name', 'grade'],
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
      order: [['createdAt', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(barbershops);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cnpj: Yup.string()
        .required()
        .length(14),
      address_id: Yup.number()
        .integer()
        .required(),
      owner: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const nameExists = await Barbershop.findOne({
      where: { name: req.body.name },
    });

    if (nameExists) {
      return res.status(400).json({ error: 'Barbershop name already exists.' });
    }

    const cnpjExists = await Barbershop.findOne({
      where: { cnpj: req.body.cnpj },
    });

    if (cnpjExists) {
      return res.status(400).json({ error: 'CNPJ already in use.' });
    }

    const checkAddressExists = await Address.findByPk(req.body.address_id);

    if (!checkAddressExists) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const checkOwnerExists = await User.findByPk(req.body.owner);

    if (!checkOwnerExists) {
      return res.status(400).json({ error: 'Owner does not exists.' });
    }

    const { id } = await Barbershop.create(req.body);

    const barbershop = await Barbershop.findByPk(id, {
      attributes: { exclude: ['address_id', 'owner'] },
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
        {
          model: User,
          attributes: { exclude: ['password_hash', 'createdAt', 'updatedAt'] },
        },
      ],
    });

    return res.json(barbershop);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      address_id: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (req.body.name) {
      const nameExists = await Barbershop.findOne({
        where: { id: { [Op.not]: req.params.id }, name: req.body.name },
      });

      if (nameExists) {
        return res
          .status(400)
          .json({ error: 'Barbershop name already exists.' });
      }
    }

    if (req.body.address_id) {
      const checkAddressExists = await Address.findByPk(req.body.address_id);

      if (!checkAddressExists) {
        return res.status(400).json({ error: 'Address does not exists' });
      }
    }

    const barbershop = await Barbershop.findByPk(req.params.id);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists. ' });
    }

    if (barbershop.owner !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You are not the owner of ther barbershop.' });
    }

    await barbershop.update(req.body);

    const updatedBarbershop = await Barbershop.findByPk(req.params.id, {
      attributes: { exclude: ['address_id', 'owner'] },
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
        {
          model: User,
          attributes: { exclude: ['password_hash', 'createdAt', 'updatedAt'] },
        },
      ],
    });

    return res.json(updatedBarbershop);
  }
}

export default new BarbershopController();
