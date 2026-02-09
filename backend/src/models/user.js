import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Define partial associations (UserProfile is the physical table)
            User.hasOne(models.ClientProfile, { foreignKey: 'userId', as: 'clientProfile', onDelete: 'CASCADE' });
            User.hasOne(models.LawyerProfile, { foreignKey: 'userId', as: 'lawyerProfile', onDelete: 'CASCADE' });
            User.hasOne(models.StaffProfile, { foreignKey: 'userId', as: 'staffProfile', onDelete: 'CASCADE' });
            User.hasOne(models.AdminProfile, { foreignKey: 'userId', as: 'adminProfile', onDelete: 'CASCADE' });
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'CLIENT', 'STAFF', 'LAWYER'),
            allowNull: false,
            defaultValue: 'CLIENT',
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'),
            defaultValue: 'ACTIVE',
        },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true, // created_at, updated_at
        underscored: true,
        hooks: {
            beforeSave: async (user) => {
                if (user.changed('password_hash')) { // Note: we'll likely set a virtual 'password' field that sets password_hash
                    // Or just handle hashing in controller/service.
                    // Let's implement a setter or expect pre-hashed, or hash here.
                    // Common pattern: user.password = 'plain'; -> hooks hash it.
                }
            }
        }
    });

    return User;
};
