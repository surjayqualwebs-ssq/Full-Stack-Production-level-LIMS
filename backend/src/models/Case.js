import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Case extends Model {
        static associate(models) {
            Case.belongsTo(models.Intake, { foreignKey: 'intake_id', as: 'intake' });
            Case.belongsTo(models.User, { foreignKey: 'client_id', as: 'client' });
            Case.belongsTo(models.User, { foreignKey: 'lawyer_id', as: 'lawyer' });
            // Case.hasMany(models.CaseUpdate, ...); // Future
        }
    }

    Case.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        intake_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One case per intake
            references: { model: 'intakes', key: 'id' }
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        lawyer_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Can be unassigned initially
            references: { model: 'users', key: 'id' }
        },
        case_number: {
            type: DataTypes.STRING, // e.g., "CIV-2024-001"
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'QUEUED'),
            defaultValue: 'QUEUED'
        },
        case_type: {
            type: DataTypes.ENUM('CIVIL', 'CRIMINAL', 'CORPORATE', 'MATRIMONIAL', 'FAMILY', 'PROPERTY'),
            allowNull: false,
            defaultValue: 'CIVIL'
        },
        next_hearing_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        start_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        client_rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 }
        },
        client_review: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Case',
        tableName: 'cases',
        timestamps: true,
        underscored: true
    });

    return Case;
};
