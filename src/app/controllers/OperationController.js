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
      opening_hour: Yup.object().shape({
        hours: Yup.number()
          .integer()
          .min(0)
          .max(23)
          .required(),
        minutes: Yup.number()
          .integer()
          .min(0)
          .max(59)
          .required(),
      }),
      closing_hour: Yup.object().shape({
        hours: Yup.number()
          .integer()
          .min(0)
          .max(23)
          .required(),
        minutes: Yup.number()
          .integer()
          .min(0)
          .max(59)
          .required(),
      }),
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

    const opHour = req.body.opening_hour.hours;
    const opMinute = req.body.opening_hour.minutes;
    const clHour = req.body.closing_hour.hours;
    const clMinute = req.body.closing_hour.minutes;

    if (opHour >= clHour) {
      return res.status(401).json({
        error: 'Opening hour is greater than or equal to closing hour.',
      });
    }

    req.body.opening_hour = `${opHour}:${opMinute}`;
    req.body.closing_hour = `${clHour}:${clMinute}`;

    const {
      weekday,
      opening_hour,
      closing_hour,
      barbershop_id,
    } = await Operation.create(req.body);

    return res.json({
      weekday,
      opening_hour,
      closing_hour,
      barbershop_id,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      opening_hour: Yup.object().shape({
        hours: Yup.number()
          .integer()
          .min(0)
          .max(23),
        minutes: Yup.number()
          .integer()
          .min(0)
          .max(59)
          .when('hours', (hours, field) => (hours ? field.required() : field)),
      }),
      closing_hour: Yup.object().shape({
        hours: Yup.number()
          .integer()
          .min(0)
          .max(23),
        minutes: Yup.number()
          .integer()
          .min(0)
          .max(59)
          .when('hours', (hours, field) => (hours ? field.required() : field)),
      }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (req.body.opening_hour && !req.body.closing_hour) {
      const opHour = req.body.opening_hour.hours;
      const opMinute = req.body.opening_hour.minutes;

      const { closing_hour } = await Operation.findByPk(req.params.id);
      const clHour = Number(closing_hour.split(':', 1));
      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }

      req.body.opening_hour = `${opHour}:${opMinute}`;
    }

    if (req.body.closing_hour && !req.body.opening_hour) {
      const clHour = req.body.closing_hour.hours;
      const clMinute = req.body.closing_hour.minutes;

      const { opening_hour } = await Operation.findByPk(req.params.id);
      const opHour = Number(opening_hour.split(':', 1));
      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }

      req.body.closing_hour = `${clHour}:${clMinute}`;
    }

    if (req.body.opening_hour && req.body.closing_hour) {
      const opHour = req.body.opening_hour.hours;
      const opMinute = req.body.opening_hour.minutes;
      const clHour = req.body.closing_hour.hours;
      const clMinute = req.body.closing_hour.minutes;

      if (opHour >= clHour) {
        return res.status(401).json({
          error: 'Opening hour is greater than or equal to closing hour.',
        });
      }

      req.body.opening_hour = `${opHour}:${opMinute}`;
      req.body.closing_hour = `${clHour}:${clMinute}`;
    }

    const operation = await Operation.findByPk(req.params.id);

    await operation.update(req.body);

    const {
      id,
      name,
      opening_hour,
      closing_hour,
      barbershop_id,
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
      barbershop_id,
      barbershop,
    });
  }

  async delete(req, res) {
    const operation = await Operation.findByPk(req.params.id, {
      include: [
        {
          model: Barbershop,
          as: 'barbershop',
          attributes: ['id', 'name', 'address', 'cnpj'],
        },
      ],
    });

    if (operation) {
      await operation.destroy();
    } else {
      return res.status(401).json({ error: 'Operation does not exists.' });
    }

    return res.send();
  }
}

export default new OperationController();
