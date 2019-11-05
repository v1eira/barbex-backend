import * as Yup from 'yup';

import State from '../models/State';
import City from '../models/City';
import Address from '../models/Address';

import UsersAddressList from '../models/UsersAddressList';
import Barbershop from '../models/Barbershop';

class FullAddressController {
  async store(req, res) {
    const schema = Yup.object().shape({
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
        .matches(
          /(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)/
        )
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const complement = req.body.complement ? req.body.complement : null;

    const cityExists = await City.findOne({
      where: { city: req.body.city },
    });

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
      street: req.body.street,
      number: req.body.number,
      complement,
      neighborhood: req.body.neighborhood,
      cep: req.body.cep,
      city_id: newCity.id,
    });

    const newAddress = await Address.findByPk(id, {
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

    return res.json(newAddress);
  }

  async delete(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid address id' });
    }

    const address = await Address.findByPk(req.params.id);

    if (!address) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    // Only users' addresses can be deleted
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
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      neighborhood: Yup.string(),
      cep: Yup.string(),
      city: Yup.string(),
      state: Yup.string()
        .min(2)
        .max(2)
        .uppercase()
        .matches(
          /(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)/
        )
        .when('city', (city, field) => (city ? field.required() : field)),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid address id' });
    }

    const address = await Address.findByPk(req.params.id, {
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

    if (!address) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const userAddress = await UsersAddressList.findOne({
      where: { address_id: req.params.id },
    });

    if (userAddress) {
      if (req.userId !== userAddress.user_id) {
        return res
          .status(401)
          .json({ error: 'User is not the owner of the address.' });
      }
    } else {
      const barbershop = await Barbershop.findOne({
        where: { address_id: req.params.id },
      });

      if (barbershop && req.userId !== barbershop.owner) {
        return res
          .status(401)
          .json({ error: 'User is not the owner of the barbershop.' });
      }
    }

    if (req.body.city && address.city.city !== req.body.city) {
      if (req.body.state && address.city.state.state !== req.body.state) {
        let newState = await State.findOne({
          where: { state: req.body.state },
        });
        if (!newState) {
          newState = await State.create({ state: req.body.state });
        }
        let newCity = await City.findOne({ where: { city: req.body.city } });
        if (!newCity) {
          newCity = await City.create({
            city: req.body.city,
            state_id: newState.id,
          });
        }
      } else {
        let newCity = await City.findOne({ where: { city: req.body.city } });
        if (!newCity) {
          newCity = await City.create({
            city: req.body.city,
            state_id: address.city.state.id,
          });
        }
      }

      const updatedCity = await City.findOne({
        where: { city: req.body.city },
      });

      await address.update({ city_id: updatedCity.id });
    }

    await address.update(req.body);

    const updatedAddress = await Address.findByPk(req.params.id, {
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
    });

    return res.json(updatedAddress);
  }
}

export default new FullAddressController();
