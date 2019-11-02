import * as Yup from 'yup';

import State from '../models/State';
import City from '../models/City';
import Address from '../models/Address';

import UsersAddressList from '../models/UsersAddressList';

class UsersAddressListController {
  async index(req, res) {
    const addresslist = await UsersAddressList.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'main'],
      include: [
        {
          model: Address,
          as: 'address',
          attributes: [
            'id',
            'street',
            'number',
            'complement',
            'neighborhood',
            'cep',
          ],
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
      order: [['main', 'DESC'], ['createdAt', 'DESC']],
    });

    return res.json(addresslist);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      address_id: Yup.number()
        .integer()
        .required(),
      main: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const addressExists = await Address.findByPk(req.body.address_id);

    if (!addressExists) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const newAddress = await UsersAddressList.findOne({
      where: { user_id: req.userId, address_id: req.body.address_id },
    });

    if (newAddress) {
      return res
        .status(400)
        .json({ error: 'Address already exists in users list.' });
    }

    const userAddress = await UsersAddressList.create({
      user_id: req.userId,
      address_id: req.body.address_id,
    });

    return res.json(userAddress);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      main: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const address = await UsersAddressList.findByPk(req.params.id);

    if (!address) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    if (req.userId !== address.user_id) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the address.' });
    }

    await address.update(req.body);

    const addressItem = await UsersAddressList.findByPk(req.params.id, {
      attributes: ['id', 'main'],
      include: [
        {
          model: Address,
          as: 'address',
          attributes: [
            'id',
            'street',
            'number',
            'complement',
            'neighborhood',
            'cep',
          ],
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
    });

    return res.json(addressItem);
  }
}

export default new UsersAddressListController();
