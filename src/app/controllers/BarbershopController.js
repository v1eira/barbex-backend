import * as Yup from 'yup';
import { Op } from 'sequelize';
import Barbershop from '../models/Barbershop';

import Image from '../models/Image';
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
        {
          model: Image,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(barbershops);
  }

  async one(req, res) {
    const { id } = req.params;
    if (Number.isNaN(Number.parseInt(id, 10))) {
      return res.status(400).jsno({ error: 'wrong id provided' });
    }
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
          model: Image,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(barbershop);
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

    const checkOwnerExists = await User.findByPk(req.userId);

    if (!checkOwnerExists) {
      return res.status(400).json({ error: 'Owner does not exists.' });
    }

    const { id } = await Barbershop.create({
      ...req.body,
      owner: req.userId,
    });

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
        {
          model: Image,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(barbershop);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      address_id: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const barbershop = await Barbershop.findByPk(req.params.id);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists. ' });
    }

    if (barbershop.owner !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of ther barbershop.' });
    }

    if (req.body.address_id) {
      const checkAddressExists = await Address.findByPk(req.body.address_id);

      if (!checkAddressExists) {
        return res.status(400).json({ error: 'Address does not exists' });
      }
    }

    if (req.body.avatar_id) {
      const checkAvatarExists = await Image.findByPk(req.body.avatar_id);

      if (!checkAvatarExists) {
        return res.status(400).json({ error: 'Avatar does not exists' });
      }
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
        {
          model: Image,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(updatedBarbershop);
  }

  async delete(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const barbershop = await Barbershop.findByPk(req.params.id);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (barbershop.owner !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop' });
    }

    const avatar = await Image.findByPk(barbershop.avatar_id);

    await barbershop.destroy();
    await avatar.destroy();

    return res.send();
  }
}

export default new BarbershopController();
