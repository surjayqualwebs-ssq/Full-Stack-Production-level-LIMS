import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Document extends Model {
        static associate(models) {
            Document.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader' });
            Document.hasMany(models.DocumentVersion, { foreignKey: 'document_id', as: 'versions' });
        }
    }

    Document.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entity_type: {
            type: DataTypes.ENUM('INTAKE', 'CASE', 'USER'), // What the doc belongs to
            allowNull: true // Nullable initially until linked
        },
        entity_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        uploader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        }
    }, {
        sequelize,
        modelName: 'Document',
        tableName: 'documents',
        timestamps: true,
        underscored: true
    });

    return Document;
};
