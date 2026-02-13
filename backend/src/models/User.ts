import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  country: string;
  timezone: string;
  currency: string;
  sports_preferences?: string[];
  karma_points: number;
  latitude?: string | null;
  longitude?: string | null;
  city?: string | null;
  bio?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'sports_preferences' | 'karma_points' | 'created_at' | 'updated_at' | 'password_hash'> {
  password?: string; // For creation/update, we accept password instead of password_hash (will be hashed automatically)
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string;
  public password_hash!: string;
  public country!: string;
  public timezone!: string;
  public currency!: string;
  public sports_preferences?: string[];
  public karma_points!: number;
  public latitude!: string | null;
  public longitude!: string | null;
  public city!: string | null;
  public bio!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Instance method to verify password
  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  // Static method to hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'AU',
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Australia/Sydney',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'AUD',
    },
    sports_preferences: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    karma_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('latitude');
        return value != null ? String(value) : null;
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('longitude');
        return value != null ? String(value) : null;
      },
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Ensure password_hash is populated before validation so NOT NULL constraint passes
      beforeValidate: async (user: User) => {
        if ((user as any).password) {
          user.password_hash = await User.hashPassword((user as any).password);
          // Clean up transient password field so it is never persisted
          delete (user as any).password;
          if ((user as any).dataValues) {
            delete (user as any).dataValues.password;
          }
        }
      },
      beforeUpdate: async (user: User) => {
        // Check if password is being updated
        if ((user as any).password) {
          user.password_hash = await User.hashPassword((user as any).password);
          // Remove password from dataValues to prevent it from being saved
          delete (user as any).password;
          if ((user as any).dataValues) {
            delete (user as any).dataValues.password;
          }
        }
      },
    },
  }
);

export default User;
