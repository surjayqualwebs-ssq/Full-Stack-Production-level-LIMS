import bcrypt from 'bcrypt';
import db from '../models/index.js';

// Models are attached to db object
const { User, ClientProfile, sequelize } = db;

export const register = async (email, password, name, role = 'CLIENT') => {
    // Start transaction
    const t = await sequelize.transaction();

    try {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email }, transaction: t });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 1. Create User
        const newUser = await User.create({
            email,
            password_hash,
            role,
            status: 'ACTIVE'
        }, { transaction: t });

        // 2. Create Profile based on role (Only CLIENT supported for public register)
        if (role === 'CLIENT') {
            await ClientProfile.create({
                userId: newUser.id,
                name: name
            }, { transaction: t });
        } else {
            // Should not happen if controller restricts it, but good safety
            throw new Error('Only CLIENT registration is allowed via this endpoint');
        }

        await t.commit();

        return {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: name
        };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const login = async (email, password) => {
    const user = await User.findOne({
        where: { email },
        include: [
            { model: db.ClientProfile, as: 'clientProfile' },
            { model: db.AdminProfile, as: 'adminProfile' },
            { model: db.LawyerProfile, as: 'lawyerProfile' },
            { model: db.StaffProfile, as: 'staffProfile' }
        ]
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (user.status === 'BANNED') {
        throw new Error('Access Denied: You have been banned from using this platform.');
    }

    if (user.status !== 'ACTIVE') {
        throw new Error('Your account is inactive. Please contact support.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        throw new Error('Invalid email or password');
    }

    // Determine profile name
    let name = 'User';
    if (user.clientProfile) name = user.clientProfile.name;
    else if (user.adminProfile) name = user.adminProfile.name;
    else if (user.lawyerProfile) name = user.lawyerProfile.name;
    else if (user.staffProfile) name = user.staffProfile.name;

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: name
    };
};
