import validator from 'validator';

export const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'URL must be a string' });
  }

  const trimmedUrl = url.trim();

  if (!validator.isURL(trimmedUrl, { require_protocol: true })) {
    return res.status(400).json({ error: 'Please provide a valid URL with http:// or https://' });
  }

  if (trimmedUrl.length > 2048) {
    return res.status(400).json({ error: 'URL is too long (max 2048 characters)' });
  }

  req.body.url = trimmedUrl;
  next();
};

export const validateSignup = (req, res, next) => {
  const { email, password, name } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  req.body.name = name.trim();
  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { name, email } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    req.body.name = name.trim();
  }

  if (email !== undefined) {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }
    req.body.email = email.toLowerCase().trim();
  }

  next();
};
