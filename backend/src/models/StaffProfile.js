import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class StaffProfile extends Model {
        static associate(models) {
            StaffProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    StaffProfile.init({
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
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'StaffProfile',
        tableName: 'staff_profiles',
        timestamps: true,
        underscored: true
    });

    return StaffProfile;
};
