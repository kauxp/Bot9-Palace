import { DataTypes } from 'sequelize';
import sequelize from './database.js';

const Conversation = sequelize.define('Conversation', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

await sequelize.sync();

export { Conversation };
