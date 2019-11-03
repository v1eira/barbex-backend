import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(400).json({ error: 'Notification does not exists' });
    }

    if (notification.user !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the notification' });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(updatedNotification);
  }
}

export default new NotificationController();
