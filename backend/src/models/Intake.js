import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Intake extends Model {
        static associate(models) {
            Intake.belongsTo(models.User, { foreignKey: 'client_id', as: 'client' });
            Intake.hasMany(models.Document, {
                foreignKey: 'entity_id',
                constraints: false,
                scope: { entity_type: 'INTAKE' },
                as: 'files'
            });
        }
    }

    Intake.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        assigned_staff_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        case_type: {
            type: DataTypes.ENUM('CIVIL', 'CORPORATE', 'CRIMINAL', 'MATRIMONIAL', 'FAMILY', 'PROPERTY'),
            allowNull: false
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        documents: {
            type: DataTypes.JSONB,
            defaultValue: [] // [{ name: "doc1.pdf", url: "...", version: 1 }]
        },
        documents_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'TEMP_REJECTED', 'PERM_REJECTED', 'APPROVED', 'CLARIFICATION_NEEDED'),
            defaultValue: 'PENDING'
        },
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        internal_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rejection_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Intake',
        tableName: 'intakes',
        timestamps: true,
        underscored: true
    });

    return Intake;
};
