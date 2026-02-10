import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Task extends Model {
        static associate(models) {
            // Task belongs to a User (assigned_to)
            Task.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
            // Task optionally belongs to a Case
            Task.belongsTo(models.Case, { foreignKey: 'related_case_id', as: 'case' });
        }
    }

    Task.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        due_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'IN_PROGRESS'),
            defaultValue: 'PENDING'
        },
        priority: {
            type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
            defaultValue: 'MEDIUM'
        },
        assigned_to: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        related_case_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'cases', key: 'id' }
        }
    }, {
        sequelize,
        modelName: 'Task',
        tableName: 'tasks',
        timestamps: true,
        underscored: true
    });

    return Task;
};
