import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }

    AuditLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Can be null for system actions or failed logins involved with unknown users
            references: { model: 'users', key: 'id' }
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entity_type: {
            type: DataTypes.STRING, // 'INTAKE', 'CASE', 'USER'
            allowNull: true
        },
        entity_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        details: {
            type: DataTypes.JSONB, // Store changed fields or reasons
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: true,
        updatedAt: false, // Audit logs are immutable, only createdAt matters
        underscored: true
    });

    return AuditLog;
};
