import fs from 'fs';
import path from 'path';
import util from 'util';
import { pipeline } from 'stream';
import db from '../models/index.js';
import { fileURLToPath } from 'url';

const pump = util.promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const createDocument = async (file, userId, meta = {}) => {
    // meta: { entity_type, entity_id, name }
    const { filename, mimetype } = file;
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFilename);

    // Save file
    await pump(file.file, fs.createWriteStream(filePath));

    // Get file stats
    const stats = fs.statSync(filePath);

    // Create Document
    const document = await db.Document.create({
        name: meta.name || filename,
        entity_type: meta.entity_type || null,
        entity_id: meta.entity_id || null,
        uploader_id: userId
    });

    // Create Version 1
    await db.DocumentVersion.create({
        document_id: document.id,
        version_number: 1,
        file_path: safeFilename, // Store relative path or filename
        original_name: filename,
        mime_type: mimetype,
        size: stats.size
    });

    return document;
};

export const addVersion = async (documentId, file, userId) => {
    const document = await db.Document.findByPk(documentId);
    if (!document) throw new Error('Document not found');

    const { filename, mimetype } = file;
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFilename);

    await pump(file.file, fs.createWriteStream(filePath));
    const stats = fs.statSync(filePath);

    // Get last version number
    const lastVersion = await db.DocumentVersion.findOne({
        where: { document_id: documentId },
        order: [['version_number', 'DESC']]
    });
    const newVersionNum = (lastVersion?.version_number || 0) + 1;

    const version = await db.DocumentVersion.create({
        document_id: documentId,
        version_number: newVersionNum,
        file_path: safeFilename,
        original_name: filename,
        mime_type: mimetype,
        size: stats.size
    });

    return version;
};

export const linkDocumentsToIntake = async (documentIds, intakeId) => {
    if (!documentIds || documentIds.length === 0) return;

    await db.Document.update(
        { entity_type: 'INTAKE', entity_id: intakeId },
        { where: { id: documentIds } }
    );
};

export const getDocumentFile = async (versionId) => {
    const version = await db.DocumentVersion.findByPk(versionId);
    if (!version) throw new Error('Version not found');

    const filePath = path.join(uploadDir, version.file_path);
    console.log(`[DEBUG] Resolved file path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File missing at path: ${filePath}`);
        throw new Error(`File not found on disk at ${filePath}`);
    }

    return { stream: fs.createReadStream(filePath), mimetype: version.mime_type, filename: version.original_name };
};
