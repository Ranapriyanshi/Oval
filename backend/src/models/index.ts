import sequelize from '../config/sequelize';
import User from './User';

// Initialize all models
const models = {
  User,
  sequelize,
};

// Define associations here if needed in the future
// Example: User.hasMany(OtherModel);

export default models;
