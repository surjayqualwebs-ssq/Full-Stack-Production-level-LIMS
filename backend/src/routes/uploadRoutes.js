import multipart from '@fastify/multipart';
import * as documentService from '../services/documentService.js';
import db from '../models/index.js'; // Need db to find latest version for download

const uploadRoutes = async (fastify, options) => {
    // Register multipart plugin here or globally? 
    // Usually better globally in app.js, but if only used here...
    // The plan said "Register new models... Create uploadRoutes.js...".
    // I will assume multipart is registered in app.js as per standard fastify patterns for global usage, 
    // OR I can register it here if I limit it to this context. 
    // Let's register it in app.js to be safe and standard. I will handle app.js update next.

    // POST /documents/upload
    fastify.post('/upload', {
        preHandler: [fastify.authenticate] // Ensure user is logged in
    }, async (req, reply) => {
        const parts = req.parts();
        let file;
        let meta = {};

        for await (const part of parts) {
            if (part.type === 'file') {
                file = part;
            } else {
                meta[part.fieldname] = part.value;
            }
        }

        if (!file) {
            throw new Error('No file uploaded');
        }

        const userId = req.user.id;
        const document = await documentService.createDocument(file, userId, meta);

        return reply.send(document);
    });

    // POST /documents/:id/versions (Optional implementation for versioning existing doc)
    fastify.post('/:id/versions', {
        preHandler: [fastify.authenticate]
    }, async (req, reply) => {
        const { id } = req.params;
        const data = await req.file(); // Single file shorthand
        if (!data) throw new Error('No file uploaded');

        const userId = req.user.id;
        const version = await documentService.addVersion(id, data, userId);
        return reply.send(version);
    });

    // GET /documents/:id/download
    fastify.get('/:id/download', {
        preHandler: [fastify.authenticate]
    }, async (req, reply) => {
        const { id } = req.params;

        // Find latest version for this document
        // We could move this logic to service "getLatestDocumentFile(docId)"
        console.log(`[DEBUG] Downloading document ${id}`);
        const latestVersion = await db.DocumentVersion.findOne({
            where: { document_id: id },
            order: [['version_number', 'DESC']]
        });

        console.log(`[DEBUG] Latest version for ${id}:`, latestVersion ? latestVersion.id : 'None');

        if (!latestVersion) {
            return reply.status(404).send({ message: 'Document not found' });
        }

        try {
            const fileData = await documentService.getDocumentFile(latestVersion.id);
            console.log(`[DEBUG] File found: ${fileData.filename}, ${fileData.mimetype}`);

            // Safety check for filename
            const safeName = fileData.filename.replace(/"/g, '');

            reply.header('Content-Disposition', `attachment; filename="${safeName}"`);
            reply.type(fileData.mimetype);
            return reply.send(fileData.stream);
        } catch (error) {
            console.error("[ERROR] Download route error:", error);
            // Check for specific service errors
            if (error.message.includes('not found')) {
                return reply.status(404).send({ message: error.message });
            }
            return reply.status(500).send({ message: `Download failed: ${error.message}` });
        }
    });
};

export default uploadRoutes;
