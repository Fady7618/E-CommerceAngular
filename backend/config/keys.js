require('dotenv').config();

module.exports = {
  mongodb: {
    uri: process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PRODUCTION 
      : process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
      ? process.env.GOOGLE_CALLBACK_URL_PRODUCTION
      : process.env.GOOGLE_CALLBACK_URL
  },
  frontend: {
    url: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL_PRODUCTION
      : process.env.FRONTEND_URL
  }
};