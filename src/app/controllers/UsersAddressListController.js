import * as Yup from 'yup';

import User from '../models/User';

import State from '../models/State';
import City from '../models/City';
import Address from '../models/Address';

import UsersAddressList from '../models/UsersAddressList';

class UsersAddressListController {
  async index(req, res) {
    const checkUserExists = await User.findByPk(req.userId);

    if (!checkUserExists) {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const addresslist = await UsersAddressList.findAll({
      where: { user_id: req.userId },
      attributes: ['id'],
      include: [
        {
          model: Address,
          as: 'address',
          attributes: [
            'id',
            'main',
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

    return res.json(addresslist);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      user_id: Yup.number()
        .integer()
        .required(),
      address_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findByPk(req.body.user_id);

    if (!userExists) {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const addressExists = await Address.findByPk(req.body.address_id);

    if (!addressExists) {
      return res.status(400).json({ error: 'Address does not exists.' });
    }

    const newAddress = await UsersAddressList.findOne({
      where: { user_id: req.body.user_id, address_id: req.body.address_id },
    });

    if (newAddress) {
      return res
        .status(400)
        .json({ error: 'Address already exists in users list.' });
    }

    const userAddress = await UsersAddressList.create(req.body);

    return res.json(userAddress);
  }
}

export default new UsersAddressListController();
