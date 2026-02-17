const axios = require('axios');
const io = require('socket.io-client');

import axios from 'axios';
import { io } from 'socket.io-client';
import process from 'process';

// Use EC2_HOST if provided, otherwise default to localhost (for dev testing)
// The user explicitly mentioned EC2_HOST is available.
const HOST = process.env.EC2_HOST || 'localhost';
const API_URL = `http://${HOST}:3168`;
const SOCKET_URL = `http://${HOST}:3168`;

// Log the target environment
if (!process.env.EC2_HOST) {
    console.warn('[WARN] EC2_HOST env variable not set. Defaulting to localhost. To target EC2, run: set EC2_HOST=x.x.x.x && node verify_scenarios.js');
} else {
    console.log(`[INFO] Targeting EC2 Host: ${HOST}`);
}

// Utils
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (msg, type = 'INFO') => console.log(`[${type}] ${msg}`);
const fail = (msg) => { console.error(`[FAIL] ${msg}`); process.exit(1); };

// State
let adminToken, clientToken, staffToken, lawyerToken;
let adminUser, clientUser, staffUser, lawyerUser;
let sockets = {};
let createdIntakeId, createdCaseId;

// 1. Setup & Auth
async function setup() {
    log('--- 1. Setup & Authentication ---');
    try {
        // Admin Login
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@lims.com',
            password: 'admin123'
        });
        adminToken = adminRes.data.token;
        adminUser = adminRes.data.user;
        log('Admin Logged In');

        // Connect Admin Socket FIRST to catch user registration events
        await connectSocket('admin', adminToken, 'ADMIN');

        // Create Users (using random suffix to avoid collisions)
        const suffix = Date.now().toString().slice(-4);

        // Register Client
        // Note: Admin socket listens for 'user:registered'
        const clientPromise = new Promise((resolve) => {
            sockets['admin'].once('user:registered', (data) => {
                log(`[Socket] Admin received user:registered for ${data.email}`, 'SUCCESS');
                resolve();
            });
        });

        // Trigger Registration (Scenario D)
        log('Triggering User Registration (Scenario D)...');
        await axios.post(`${API_URL}/admin/users`, {
            name: `Test Client ${suffix}`,
            email: `client${suffix}@test.com`,
            password: 'password123',
            role: 'CLIENT'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        await clientPromise; // Wait for socket event

        // Login Client
        const clientRes = await axios.post(`${API_URL}/auth/login`, {
            email: `client${suffix}@test.com`,
            password: 'password123'
        });
        clientToken = clientRes.data.token;
        clientUser = clientRes.data.user;
        log('Client Created & Logged In');

        // Create/Login Staff
        await axios.post(`${API_URL}/admin/users`, {
            name: `Test Staff ${suffix}`,
            email: `staff${suffix}@test.com`,
            password: 'password123',
            role: 'STAFF',
            department: 'LEGAL'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        const staffRes = await axios.post(`${API_URL}/auth/login`, {
            email: `staff${suffix}@test.com`,
            password: 'password123'
        });
        staffToken = staffRes.data.token;
        staffUser = staffRes.data.user;
        log('Staff Created & Logged In');

        // Create/Login Lawyer
        await axios.post(`${API_URL}/admin/users`, {
            name: `Test Lawyer ${suffix}`,
            email: `lawyer${suffix}@test.com`,
            password: 'password123',
            role: 'LAWYER',
            case_types: ['CIVIL'],
            experience_years: 5,
            rating: 5,
            rating_count: 0,
            consultation_fee: 1000
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        const lawyerRes = await axios.post(`${API_URL}/auth/login`, {
            email: `lawyer${suffix}@test.com`,
            password: 'password123'
        });
        lawyerToken = lawyerRes.data.token;
        lawyerUser = lawyerRes.data.user;
        log('Lawyer Created & Logged In');

    } catch (error) {
        fail(`Setup failed: ${error.response?.data?.message || error.message}`);
    }
}

async function connectSocket(role, token, userRole) {
    return new Promise((resolve, reject) => {
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            log(`${role} Socket Connected (${socket.id})`);
            sockets[role] = socket;
            resolve(socket);
        });

        socket.on('connect_error', (err) => {
            reject(`Socket connection error for ${role}: ${err.message}`);
        });

        // Setup generic listeners for debugging
        socket.onAny((event, ...args) => {
            // log(`[${role}] Event: ${event}`);
        });
    });
}

// Scenario A: Intake Submission
async function scenarioA() {
    log('\n--- Scenario A: Intake Submission ---');

    // Connect remaining sockets
    await connectSocket('client', clientToken, 'CLIENT');
    await connectSocket('staff', staffToken, 'STAFF');

    const intakePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject('Timeout waiting for dashboard:intake-added'), 5000);
        sockets['staff'].on('dashboard:intake-added', (data) => {
            clearTimeout(timeout);
            if (data.client_id === clientUser.id) {
                log(`[Socket] Staff received dashboard:intake-added for Intake #${data.id}`, 'SUCCESS');
                createdIntakeId = data.id;
                resolve();
            }
        });
    });

    try {
        log('Client submitting intake...');
        await axios.post(`${API_URL}/client/intakes`, {
            caseType: 'CIVIL',
            details: JSON.stringify({ description: 'Test Case Scenario A' })
        }, { headers: { Authorization: `Bearer ${clientToken}` } });

        await intakePromise;
    } catch (e) {
        fail(e);
    }
}

// Scenario B: Approval & Case Creation
async function scenarioB() {
    log('\n--- Scenario B: Intake Approval & Case Creation ---');

    // Connect Lawyer (to receive case assignment if selected)
    await connectSocket('lawyer', lawyerToken, 'LAWYER');

    const clientUpdatePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject('Timeout waiting for intake:updated'), 5000);
        sockets['client'].on('intake:updated', (data) => {
            if (data.id === createdIntakeId && data.status === 'APPROVED') {
                clearTimeout(timeout);
                log(`[Socket] Client received intake:updated (APPROVED)`, 'SUCCESS');
                resolve();
            }
        });
    });

    // We might also check if Lawyer gets assigned, but auto-assignment depends on logic (load balancing).
    // Our test lawyer has 0 cases, so likely will get it.
    const lawyerAssignmentPromise = new Promise((resolve) => {
        sockets['lawyer'].once('case:assigned', (data) => {
            log(`[Socket] Lawyer received case:assigned for Case ${data.case_number}`, 'SUCCESS');
            createdCaseId = data.id;
            resolve();
        });
    });

    try {
        log(`Staff approving Intake #${createdIntakeId}...`);
        await axios.put(`${API_URL}/staff/intakes/${createdIntakeId}/review`, {
            action: 'APPROVE'
        }, { headers: { Authorization: `Bearer ${staffToken}` } });

        await Promise.all([clientUpdatePromise, lawyerAssignmentPromise]);
    } catch (e) {
        fail(e.message || e);
    }
}

// Scenario C: Case Update
async function scenarioC() {
    log('\n--- Scenario C: Case Update ---');

    if (!createdCaseId) {
        fail('Skipping Scenario C because no Case ID was captured in Scenario B.');
    }

    const clientCaseUpdatePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject('Timeout waiting for case:updated'), 5000);
        sockets['client'].on('case:updated', (data) => {
            if (data.id === createdCaseId && data.status === 'IN_PROGRESS') {
                clearTimeout(timeout);
                log(`[Socket] Client received case:updated (IN_PROGRESS)`, 'SUCCESS');
                resolve();
            }
        });
    });

    try {
        log(`Lawyer updating Case #${createdCaseId}...`);
        await axios.put(`${API_URL}/lawyer/cases/${createdCaseId}/details`, {
            status: 'IN_PROGRESS',
            notes: 'Investigation started.'
        }, { headers: { Authorization: `Bearer ${lawyerToken}` } });

        await clientCaseUpdatePromise;
    } catch (e) {
        fail(e.message || e);
    }
}

async function run() {
    try {
        await setup(); // Includes Scenario D (User Registration)
        await scenarioA();
        await scenarioB();
        await scenarioC();

        log('\n--- ALL VERIFICATION SCENARIOS PASSED ---', 'SUCCESS');
        process.exit(0);
    } catch (e) {
        fail(e);
    } finally {
        Object.values(sockets).forEach(s => s.disconnect());
    }
}

run();
