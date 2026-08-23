import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['patient', 'admin']).default('patient'),
    phone: z.string().optional(),
    age: z.number().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    bloodGroup: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    preferredLanguage: z.string().optional(),
    abhaId: z.string().optional(),
    emergencyContact: z.string().optional(),
    adminSecretCode: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(4, 'OTP is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const register = async (req, res) => {
    try {
        if (req.body.role === 'doctor') {
            res.status(403).json({
                success: false,
                message: 'Doctor registration is restricted to Administrators only. Doctors must be credentialed through the Admin Portal.',
            });
            return;
        }

        const validatedData = registerSchema.parse(req.body);
        const existing = dbStore.findUserByEmail(validatedData.email);
        if (existing) {
            res.status(400).json({ success: false, message: 'An account with this email already exists' });
            return;
        }

        const role = validatedData.role || 'patient';

        // Security Guard: If registering as Admin, verify the secret admin passcode
        if (role === 'admin') {
            if (!validatedData.adminSecretCode || validatedData.adminSecretCode.trim() !== config.adminSecretKey.trim()) {
                res.status(403).json({
                    success: false,
                    message: 'Invalid Admin Passcode. You must provide the valid Admin Secret Code to create an Administrator account.',
                });
                return;
            }
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const userId = `usr-${Date.now()}`;

        const newUser = dbStore.addUser({
            id: userId,
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role,
            phone: validatedData.phone || '+91 ',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(validatedData.name)}`,
            status: 'active',
            age: validatedData.age || 28,
            gender: validatedData.gender || 'Other',
            bloodGroup: validatedData.bloodGroup || 'O+',
            city: validatedData.city || 'Bengaluru',
            state: validatedData.state || 'Karnataka',
            preferredLanguage: validatedData.preferredLanguage || 'English',
            abhaId: validatedData.abhaId || '',
            emergencyContact: validatedData.emergencyContact || '',
            allergies: [],
            chronicConditions: [],
            createdAt: new Date().toISOString(),
        });

        // Audit log
        dbStore.addAuditLog({
            eventType: 'USER_REGISTER',
            actorId: newUser.id,
            actorEmail: newUser.email,
            actorRole: newUser.role,
            details: `New ${newUser.role} account created for ${newUser.name}.`,
        });

        // Welcome notification
        dbStore.addNotification({
            userId: newUser.id,
            role: newUser.role,
            type: 'security',
            title: 'Welcome to MediGuide India!',
            message: 'Your personal AI-assisted healthcare vault is active. Explore our AI Symptom Checker and Doctor Discovery.',
            link: '/dashboard',
        });

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, config.jwtSecret, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = dbStore.findUserByEmail(email);
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Account has been suspended by administration' });
            return;
        }
        if (!user.password) {
            res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        // Record login audit log
        dbStore.addAuditLog({
            eventType: 'USER_LOGIN',
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            details: `${user.role.toUpperCase()} ${user.name} logged into MediGuide portal.`,
        });

        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

export const demoLogin = async (req, res) => {
    const { role } = req.body;
    let targetEmail = 'patient@mediguide.com';
    if (role === 'doctor') {
        targetEmail = 'doctor.smith@mediguide.com';
    } else if (role === 'admin') {
        targetEmail = 'admin@mediguide.com';
    }
    const user = dbStore.findUserByEmail(targetEmail);
    if (!user) {
        res.status(404).json({ success: false, message: `Demo user for role ${role} not found` });
        return;
    }

    dbStore.addAuditLog({
        eventType: 'DEMO_LOGIN',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `Demo session initiated as ${user.role} (${user.name}).`,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: `Logged in as Demo ${user.role.toUpperCase()}`,
        token,
        user: userWithoutPassword,
    });
};

export const getMe = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ success: true, user: userWithoutPassword });
};

export const updateProfile = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const allowedUpdates = [
        'name', 'phone', 'avatar', 'age', 'gender', 'bloodGroup',
        'allergies', 'chronicConditions', 'emergencyContact',
        'city', 'state', 'preferredLanguage', 'abhaId'
    ];
    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }
    const updatedUser = dbStore.updateUser(req.user.id, updates);
    if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }

    dbStore.addAuditLog({
        eventType: 'PROFILE_UPDATED',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: `User ${req.user.name} updated profile details.`,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, message: 'Profile updated successfully', user: userWithoutPassword });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const user = dbStore.findUserByEmail(email);
        if (!user) {
            // For security, don't leak user existence
            res.json({
                success: true,
                message: 'If an account exists with this email, password reset instructions and OTP (Default demo OTP: 123456) have been sent.',
            });
            return;
        }

        dbStore.addAuditLog({
            eventType: 'PASSWORD_RESET_REQUEST',
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            details: `Password reset OTP requested for ${user.email}.`,
        });

        res.json({
            success: true,
            message: 'Password reset OTP sent to registered email. For demo testing, use OTP: 123456.',
            demoOtp: '123456',
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid email address' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
        const user = dbStore.findUserByEmail(email);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (otp !== '123456' && otp !== '999999') {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        dbStore.updateUser(user.id, { password: hashedPassword });

        dbStore.addAuditLog({
            eventType: 'PASSWORD_RESET_SUCCESS',
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            details: `Password was successfully updated for ${user.email}.`,
        });

        res.json({ success: true, message: 'Password has been successfully reset. You can now log in.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
};

export const exportUserData = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = dbStore.exportUserData(req.user.id);
        if (!data) {
            res.status(404).json({ success: false, message: 'User data not found' });
            return;
        }

        dbStore.addAuditLog({
            eventType: 'DPDP_DATA_EXPORT',
            actorId: req.user.id,
            actorEmail: req.user.email,
            actorRole: req.user.role,
            details: `User exported personal health and consultation data package under DPDP compliance.`,
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export data' });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        dbStore.addAuditLog({
            eventType: 'DPDP_ACCOUNT_PURGE',
            actorId: req.user.id,
            actorEmail: req.user.email,
            actorRole: req.user.role,
            details: `User requested permanent account and medical records erasure under Right to Erasure.`,
        });

        dbStore.purgeUserData(req.user.id);
        res.json({ success: true, message: 'Account and associated records have been permanently deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
};

export const getDemoAccounts = async (_req, res) => {
    res.json({
        success: true,
        demoAccounts: [
            {
                role: 'patient',
                title: 'Patient Account',
                name: 'Rahul Sharma (Bengaluru)',
                email: 'patient@mediguide.com',
                description: 'Experience AI symptom checking, medicine adherence tracking, doctor booking in IST, and digital document vault.',
            },
            {
                role: 'doctor',
                title: 'Doctor Account',
                name: 'Dr. Priya Sharma (MD, AIIMS New Delhi)',
                email: 'doctor.smith@mediguide.com',
                description: 'Manage patient consultations, configure availability schedules, write structured digital prescriptions with downloadable PDF.',
            },
            {
                role: 'admin',
                title: 'Admin Account',
                name: 'Vikramaditya Roy (Platform Administrator)',
                email: 'admin@mediguide.com',
                description: 'Oversee healthcare platform metrics, approve doctor credentials, manage medical departments, inspect security audit trails.',
            },
        ],
    });
};
