import * as Yup from 'yup';

import Barbershop from '../models/Barbershop';
import Service from '../models/Service';
import BarbershopService from '../models/BarbershopService';

class BarbershopServiceController {
  async index(req, res) {
    const barbershopServices = await BarbershopService.findAll({
      attributes: ['id', 'price'],
      where: { barbershop_id: req.params.barbershopId },
      include: [
        {
          model: Service,
          attributes: ['name'],
        },
      ],
    });

    return res.json(barbershopServices);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      service_id: Yup.number()
        .integer()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (req.userId !== barbershop.owner) {
      return res
        .status(400)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const serviceExists = await BarbershopService.findOne({
      where: {
        barbershop_id: req.params.barbershopId,
        service_id: req.body.service_id,
      },
    });

    if (serviceExists) {
      return res.status(400).json({ error: 'Service already exists.' });
    }

    const typeExists = Service.findByPk(req.body.service_id);

    if (!typeExists) {
      return res
        .status(400)
        .json({ error: 'This type of service does not exists.' });
    }

    const barbershopService = await BarbershopService.create({
      ...req.body,
      barbershop_id: req.params.barbershopId,
    });

    return res.json(barbershopService);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (req.userId !== barbershop.owner) {
      return res
        .status(400)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const service = await BarbershopService.findByPk(req.params.serviceId);

    if (!service) {
      return res.status(400).json({ error: 'Service does not exists.' });
    }

    const updatedService = await service.update(req.body);

    return res.json(updatedService);
  }

  async delete(req, res) {
    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (req.userId !== barbershop.owner) {
      return res
        .status(400)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const barbershopService = await BarbershopService.findByPk(
      req.params.serviceId
    );

    if (!barbershopService) {
      return res.status(400).json({ error: 'Service does not exists.' });
    }

    await barbershopService.destroy();

    return res.send();
  }
}

export default new BarbershopServiceController();
