import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class ClientProfile extends Model {
        static associate(models) {
            ClientProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    ClientProfile.init({
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
            allowNull: true // Can be updated later
        },
        gender: {
            type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'ClientProfile',
        tableName: 'client_profiles',
        timestamps: true,
        underscored: true
    });

    return ClientProfile;
};
