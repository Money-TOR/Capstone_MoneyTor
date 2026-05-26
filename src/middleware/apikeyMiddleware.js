const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'API Key tidak valid.'
    });
  }
  next();
};

module.exports = verifyApiKey; 