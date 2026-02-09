import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class AdminProfile extends Model {
        static associate(models) {
            AdminProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    AdminProfile.init({
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'AdminProfile',
        tableName: 'admin_profiles',
        timestamps: true,
        underscored: true
    });

    return AdminProfile;
};
