import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class DocumentVersion extends Model {
        static associate(models) {
            DocumentVersion.belongsTo(models.Document, { foreignKey: 'document_id', as: 'document' });
        }
    }

    DocumentVersion.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        document_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'documents', key: 'id' }
        },
        version_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        original_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mime_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'DocumentVersion',
        tableName: 'document_versions',
        timestamps: true,
        underscored: true
    });

    return DocumentVersion;
};
