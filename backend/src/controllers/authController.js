import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLE_PERMISSIONS } from '../utils/permissions.js';
import { setAuthCookie, signToken } from '../middleware/auth.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({
    token,
    user: user.toPublic(),
    permissions: ROLE_PERMISSIONS[user.role],
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Signed out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user.toPublic(),
    permissions: ROLE_PERMISSIONS[req.user.role],
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, timezone, avatar, title } = req.body;
  if (name) req.user.name = name;
  if (timezone) req.user.timezone = timezone;
  if (avatar !== undefined) req.user.avatar = avatar;
  if (title) req.user.title = title;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

export const updateSettings = asyncHandler(async (req, res) => {
  req.user.settings = { ...req.user.settings.toObject?.() ?? req.user.settings, ...req.body };
  if (req.body.timezone) req.user.timezone = req.body.timezone;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});
