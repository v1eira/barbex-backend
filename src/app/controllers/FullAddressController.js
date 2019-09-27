import * as Yup from 'yup';

import State from '../models/State';
import City from '../models/City';
import Address from '../models/Address';

import UsersAddressList from '../models/UsersAddressList';

class FullAddressController {
  async store(req, res) {
    const schema = Yup.object().shape({
      main: Yup.boolean(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      neighborhood: Yup.string().required(),
      cep: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string()
        .min(2)
        .max(2)
        .uppercase()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const cityExists = await City.findOne({
      where: { city: req.body.city },
    });

    if (cityExists) {
      const addressExists = await Address.findOne({
        where: {
          street: req.body.street,
          number: req.body.number,
          complement: req.body.complement,
          city_id: cityExists.id,
        },
        attributes: { exclude: ['city_id'] },
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
      });

      if (addressExists) {
        return res.json(addressExists);
      }
    }

    if (!cityExists) {
      const stateExists = await State.findOne({
        where: { state: req.body.state },
      });

      if (stateExists) {
        await City.create({ city: req.body.city, state_id: stateExists.id });
      } else {
        const newState = await State.create({ state: req.body.state });
        await City.create({ city: req.body.city, state_id: newState.id });
      }
    }

    const newCity = await City.findOne({ where: { city: req.body.city } });

    const { id } = await Address.create({
      main: req.body.main,
      street: req.body.street,
      number: req.body.number,
      complement: req.body.complement,
      neighborhood: req.body.neighborhood,
      cep: req.body.cep,
      city_id: newCity.id,
    });

    const {
      main,
      street,
      number,
      complement,
      neighborhood,
      cep,
      city,
      state,
    } = await Address.findByPk(id, {
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['city'],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['state'],
            },
          ],
        },
      ],
    });

    return res.json({
      id,
      main,
      street,
      number,
      complement,
      neighborhood,
      cep,
      city,
      state,
    });
  }

  async delete(req, res) {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const userIsOwner = await UsersAddressList.findOne({
      where: { user_id: req.userId, address_id: req.params.id },
    });

    if (!userIsOwner) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the address.' });
    }

    await address.destroy();

    return res.send();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      main: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const address = await Address.findByPk(id);

    if (!address) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const userIsOwner = await UsersAddressList.findOne({
      where: { user_id: req.userId, address_id: req.params.id },
    });

    if (!userIsOwner) {
      return res
        .status(400)
        .json({ error: 'User is not the owner of the address.' });
    }

    await address.update(req.body);

    const {
      main,
      street,
      number,
      complement,
      neighborhood,
      cep,
      city,
      state,
    } = await Address.findByPk(id, {
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['city'],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['state'],
            },
          ],
        },
      ],
    });

    return res.json({
      id,
      main,
      street,
      number,
      complement,
      neighborhood,
      cep,
      city,
      state,
    });
  }
}

export default new FullAddressController();
