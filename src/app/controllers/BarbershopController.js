import * as Yup from 'yup';
import Barbershop from '../models/Barbershop';

class BarbershopController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const barbershops = await Barbershop.findAll({
      attributes: ['id', 'name', 'address', 'cnpj'],
      order: [['createdAt', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(barbershops);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      cnpj: Yup.string()
        .required()
        .length(14),
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

    const { id, name, address, cnpj } = await Barbershop.create(req.body);

    return res.json({
      id,
      name,
      address,
      cnpj,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      address: Yup.string(),
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

    const barbershop = await Barbershop.findByPk(req.params.id);

    await barbershop.update(req.body);

    const { id, name, address, cnpj } = await Barbershop.findByPk(
      req.params.id
    );

    return res.json({
      id,
      name,
      address,
      cnpj,
    });
  }
}

export default new BarbershopController();
