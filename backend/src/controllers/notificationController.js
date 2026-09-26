import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(30);
  const unread = items.filter((item) => !item.read).length;
  res.json({ items, unread });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true },
  );
  if (!item) throw new ApiError(404, 'Notification not found');
  res.json(item);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});
