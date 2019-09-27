import * as Yup from 'yup';
import Operation from '../models/Operation';
import Barbershop from '../models/Barbershop';

class OperationController {
  async index(req, res) {
    const checkBarberShopExists = await Barbershop.findOne({
      where: { id: req.params.barbershopId },
    });

    if (!checkBarberShopExists) {
      return res.status(400).json({ error: 'Barber Shop does not exists.' });
    }

    const operations = await Operation.findAll({
      where: { barbershop_id: req.params.barbershopId },
      attributes: { exclude: ['barbershop_id'] },
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name', 'address', 'cnpj'],
        },
      ],
    });

    return res.json(operations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      weekday: Yup.string()
        .matches(/(dom|seg|ter|qua|qui|sex|sab)/, { excludeEmptyString: true })
        .required(),
      opening_hour: Yup.string()
        .matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)
        .required(),
      closing_hour: Yup.string()
        .matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)
        .required(),
      barbershop_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const barbershopExists = await Barbershop.findOne({
      where: { id: req.body.barbershop_id },
    });

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const weekdayExists = await Operation.findOne({
      where: {
        barbershop_id: req.body.barbershop_id,
        weekday: req.body.weekday,
      },
    });

    if (weekdayExists) {
      return res.status(400).json({
        error:
          'There is already an Operation entry for this weekday. Try updating it instead.',
      });
    }

    const opHour = Number(req.body.opening_hour.split(':', 1));
    const clHour = Number(req.body.closing_hour.split(':', 1));

    if (opHour >= clHour) {
      return res.status(401).json({
        error: 'Opening hour is greater than or equal to closing hour.',
      });
    }

    const { id } = await Operation.create(req.body);

    const {
      weekday,
      opening_hour,
      closing_hour,
      barbershop,
    } = await Operation.findByPk(id, {
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name', 'address', 'cnpj'],
        },
      ],
    });

    return res.json({
      weekday,
      opening_hour,
      closing_hour,
      barbershop,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      opening_hour: Yup.string()
        .matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)
        .when('closing_hour', (closing_hour, field) =>
          closing_hour ? field : field.required()
        ),
      closing_hour: Yup.string().matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Se os dois campos de horário foram enviados na requisição
    if (req.body.opening_hour && req.body.closing_hour) {
      const opHour = Number(req.body.opening_hour.split(':', 1));
      const clHour = Number(req.body.closing_hour.split(':', 1));

      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }
    }

    // Se apenas um dos campos de horário foi enviado na requisição
    if (req.body.opening_hour) {
      const opHour = Number(req.body.opening_hour.split(':', 1));

      const clHour = await Operation.findByPk(req.params.id, {
        attributes: ['closing_hour'],
      });

      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }
    } else {
      const clHour = Number(req.body.closing_hour.split(':', 1));
      const opHour = await Operation.findByPk(req.params.id, {
        attributes: ['opening_hour'],
      });

      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }
    }

    const operation = await Operation.findByPk(req.params.id);

    await operation.update(req.body);

    const {
      id,
      name,
      opening_hour,
      closing_hour,
      barbershop,
    } = await Operation.findByPk(req.params.id, {
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name', 'address', 'cnpj'],
        },
      ],
    });

    return res.json({
      id,
      name,
      opening_hour,
      closing_hour,
      barbershop,
    });
  }

  async delete(req, res) {
    const operation = await Operation.findByPk(req.params.id);

    if (operation) {
      await operation.destroy();
    } else {
      return res.status(401).json({ error: 'Operation does not exists.' });
    }

    return res.send();
  }
}

export default new OperationController();
