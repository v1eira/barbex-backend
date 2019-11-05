import * as Yup from 'yup';
import Operation from '../models/Operation';
import Barbershop from '../models/Barbershop';

class OperationController {
  async index(req, res) {
    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const checkBarberShopExists = await Barbershop.findOne({
      where: { id: req.params.barbershopId },
    });

    if (!checkBarberShopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    const operations = await Operation.findAll({
      where: { barbershop_id: req.params.barbershopId },
      attributes: { exclude: ['barbershop_id', 'createdAt', 'updatedAt'] },
      order: [['id']],
    });

    return res.json(operations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      weekday: Yup.string()
        .matches(
          /(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)/,
          {
            excludeEmptyString: true,
          }
        )
        .required(),
      opening_hour: Yup.string()
        .matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)
        .required(),
      closing_hour: Yup.string()
        .matches(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    const barbershopExists = await Barbershop.findOne({
      where: { id: req.params.barbershopId },
    });

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists.' });
    }

    if (req.userId !== barbershopExists.owner) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop.' });
    }

    const weekdayExists = await Operation.findOne({
      where: {
        barbershop_id: req.params.barbershopId,
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

    const { id } = await Operation.create({
      ...req.body,
      barbershop_id: req.params.barbershopId,
    });

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
          attributes: ['id', 'name', 'cnpj'],
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

    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid operation id' });
    }

    const barbershopExists = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershopExists) {
      return res.status(400).json({ error: 'Barbershop does not exists' });
    }

    if (req.userId !== barbershopExists.owner) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop' });
    }

    const operation = await Operation.findByPk(req.params.id);

    // Se os dois campos de horário foram enviados na requisição
    if (req.body.opening_hour && req.body.closing_hour) {
      const opHour = Number(req.body.opening_hour.split(':', 1));
      const clHour = Number(req.body.closing_hour.split(':', 1));

      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }
    } else if (req.body.opening_hour || req.body.closing_hour) {
      // Se apenas um dos campos de horário foi enviado na requisição
      if (req.body.opening_hour) {
        const opHour = Number(req.body.opening_hour.split(':', 1));

        if (opHour >= operation.closing_hour) {
          return res.status(401).json({
            error: 'Opening hour is greater than or equal to closing hour.',
          });
        }
      } else {
        const clHour = Number(req.body.closing_hour.split(':', 1));

        if (operation.opening_hour >= clHour) {
          return res.status(401).json({
            error: 'Opening hour is greater than or equal to closing hour.',
          });
        }
      }
    }

    await operation.update(req.body);

    const { id, name, opening_hour, closing_hour } = await Operation.findByPk(
      req.params.id
    );

    return res.json({
      id,
      name,
      opening_hour,
      closing_hour,
    });
  }

  async delete(req, res) {
    if (!Number.isInteger(Number(req.params.barbershopId))) {
      return res.status(400).json({ error: 'Invalid barbershop id' });
    }

    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid operation id' });
    }

    const barbershop = await Barbershop.findByPk(req.params.barbershopId);

    if (!barbershop) {
      return res.status(400).json({ error: 'Babershop does not exists' });
    }

    if (req.userId !== barbershop.owner) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the barbershop' });
    }

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
