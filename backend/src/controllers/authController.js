import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    age: z.number().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    bloodGroup: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const existing = dbStore.findUserByEmail(validatedData.email);
        if (existing) {
            res.status(400).json({ success: false, message: 'An account with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const userId = `usr-${Date.now()}`;
        const newUser = dbStore.addUser({
            id: userId,
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: 'patient', // Strictly default to patient on public registration to prevent privilege escalation
            phone: validatedData.phone || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(validatedData.name)}`,
            status: 'active',
            age: validatedData.age,
            gender: validatedData.gender,
            bloodGroup: validatedData.bloodGroup || 'O+',
            allergies: [],
            chronicConditions: [],
            createdAt: new Date().toISOString(),
        });
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, config.jwtSecret, { expiresIn: '7d' });
        // Exclude password in response
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
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
        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
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
    }
    else if (role === 'admin') {
        targetEmail = 'admin@mediguide.com';
    }
    const user = dbStore.findUserByEmail(targetEmail);
    if (!user) {
        res.status(404).json({ success: false, message: `Demo user for role ${role} not found` });
        return;
    }
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
        'allergies', 'chronicConditions', 'emergencyContact'
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
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, message: 'Profile updated successfully', user: userWithoutPassword });
};
export const getDemoAccounts = async (_req, res) => {
    res.json({
        success: true,
        demoAccounts: [
            {
                role: 'patient',
                title: 'Patient Account',
                name: 'Sarah Johnson',
                email: 'patient@mediguide.com',
                description: 'Experience AI symptom checking, medicine tracking, booking appointments, and digital records.',
            },
            {
                role: 'doctor',
                title: 'Doctor Account',
                name: 'Dr. John Smith (MD, Internal Med)',
                email: 'doctor.smith@mediguide.com',
                description: 'Review patient appointments, confirm bookings, write digital prescriptions, and view medical histories.',
            },
            {
                role: 'admin',
                title: 'Admin Account',
                name: 'Alex Rivera (Administrator)',
                email: 'admin@mediguide.com',
                description: 'Oversee system metrics, manage registered users, approve doctors, and monitor active services.',
            },
        ],
    });
};
