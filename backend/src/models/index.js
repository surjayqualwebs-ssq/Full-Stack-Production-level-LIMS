import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import configFull from '../config/config.cjs';
import UserModel from './user.js';
import ClientProfileModel from './ClientProfile.js';
import LawyerProfileModel from './LawyerProfile.js';
import StaffProfileModel from './StaffProfile.js';
import AdminProfileModel from './AdminProfile.js';
import IntakeModel from './Intake.js';
import CaseModel from './Case.js';
import AuditLogModel from './AuditLog.js';
import TaskModel from './Task.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFull[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const ClientProfile = ClientProfileModel(sequelize, Sequelize.DataTypes);
const LawyerProfile = LawyerProfileModel(sequelize, Sequelize.DataTypes);
const StaffProfile = StaffProfileModel(sequelize, Sequelize.DataTypes);
const AdminProfile = AdminProfileModel(sequelize, Sequelize.DataTypes);
import DocumentModel from './Document.js';
import DocumentVersionModel from './DocumentVersion.js';

const Intake = IntakeModel(sequelize, Sequelize.DataTypes);
const Case = CaseModel(sequelize, Sequelize.DataTypes);
const AuditLog = AuditLogModel(sequelize, Sequelize.DataTypes);
const Task = TaskModel(sequelize, Sequelize.DataTypes);
const Document = DocumentModel(sequelize, Sequelize.DataTypes);
const DocumentVersion = DocumentVersionModel(sequelize, Sequelize.DataTypes);

db.User = User;
db.ClientProfile = ClientProfile;
db.LawyerProfile = LawyerProfile;
db.StaffProfile = StaffProfile;
db.AdminProfile = AdminProfile;
db.Intake = Intake;
db.Case = Case;
db.AuditLog = AuditLog;
db.Task = Task;
db.Document = Document;
db.DocumentVersion = DocumentVersion;

// Setup associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
