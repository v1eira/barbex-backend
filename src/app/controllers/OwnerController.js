import Barbershop from '../models/Barbershop';
import Image from '../models/Image';

class OwnerController {
  async index(req, res) {
    const barbershops = await Barbershop.findAll({
      where: { owner: req.userId },
      include: [
        {
          model: Image,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(barbershops);
  }
}

export default new OwnerController();
