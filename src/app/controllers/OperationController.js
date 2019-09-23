// import * as Yup from 'yup';
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
    });

    return res.json(operations);
  }

  // async store(req, res) {}

  // async update(req, res) {}

  // async delete(req, res) {}
}

export default new OperationController();
