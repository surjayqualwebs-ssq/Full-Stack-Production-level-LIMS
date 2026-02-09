import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class LawyerProfile extends Model {
        static associate(models) {
            LawyerProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    LawyerProfile.init({
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
        experience_years: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        rating_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        case_types: {
            // Storing as JSON array of strings: ["CIVIL", "CRIMINAL"]
            type: DataTypes.JSONB,
            defaultValue: []
        },
        active_case_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        consultation_fee: {
            type: DataTypes.INTEGER,
            defaultValue: 500
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'LawyerProfile',
        tableName: 'lawyer_profiles',
        timestamps: true,
        underscored: true
    });

    return LawyerProfile;
};
