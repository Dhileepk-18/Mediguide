import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import {
  User,
  Doctor,
  Appointment,
  Prescription,
  Medicine,
  HealthRecord,
  AuditLog,
  Notification,
} from '../models/schemas.js';

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

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  age: z.number().min(0).max(120).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  emergencyContact: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  preferredLanguage: z.string().optional(),
  abhaId: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'OTP is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const generateTokens = user => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion || 0 },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    if (req.body.role === 'doctor') {
      res.status(403).json({
        success: false,
        message:
          'Doctor registration is restricted to Administrators only. Doctors must be credentialed through the Admin Portal.',
      });
      return;
    }

    const validatedData = registerSchema.parse(req.body);

    if (isDbConnected()) {
      const existing = await User.findOne({ email: validatedData.email.toLowerCase() }).lean();
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'An account with this email already exists' });
      }
    } else {
      const existing = dbStore.findUserByEmail(validatedData.email);
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'An account with this email already exists' });
      }
    }

    const role = validatedData.role || 'patient';

    // Security Guard: If registering as Admin, verify the secret admin passcode
    if (role === 'admin') {
      if (
        !validatedData.adminSecretCode ||
        validatedData.adminSecretCode.trim() !== config.adminSecretKey.trim()
      ) {
        res.status(403).json({
          success: false,
          message:
            'Invalid Admin Passcode. You must provide the valid Admin Secret Code to create an Administrator account.',
        });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const userId = `usr-${Date.now()}`;

    const userData = {
      id: userId,
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
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
    };

    if (isDbConnected()) {
      const createdUser = await User.create(userData);
      const newUser = createdUser.toObject();

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'USER_REGISTER',
        actorId: newUser.id,
        actorEmail: newUser.email,
        actorRole: newUser.role,
        details: `New ${newUser.role} account created for ${newUser.name}.`,
      });

      await Notification.create({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        role: newUser.role,
        type: 'security',
        title: 'Welcome to MediGuide India!',
        message:
          'Your personal AI-assisted healthcare vault is active. Explore our AI Symptom Checker and Doctor Discovery.',
        link: '/dashboard',
      });

      const { accessToken, refreshToken } = generateTokens(newUser);
      await User.findOneAndUpdate({ id: newUser.id }, { $set: { refreshToken } });

      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: accessToken,
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      });
    }

    const newUser = dbStore.addUser(userData);

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
      message:
        'Your personal AI-assisted healthcare vault is active. Explore our AI Symptom Checker and Doctor Discovery.',
      link: '/dashboard',
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    dbStore.updateUser(newUser.id, { refreshToken });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: accessToken,
      accessToken,
      refreshToken,
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

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() }).lean();
    } else {
      user = dbStore.findUserByEmail(email);
    }

    if (!user) {
      if (isDbConnected()) {
        await AuditLog.create({
          id: `aud-${Date.now()}`,
          eventType: 'FAILED_LOGIN_ATTEMPT',
          actorId: 'unknown',
          actorEmail: email.toLowerCase(),
          actorRole: 'unknown',
          details: `Failed authentication attempt for unregistered email: ${email}`,
        }).catch(() => {});
      } else {
        dbStore.addAuditLog({
          eventType: 'FAILED_LOGIN_ATTEMPT',
          actorId: 'unknown',
          actorEmail: email.toLowerCase(),
          actorRole: 'unknown',
          details: `Failed authentication attempt for unregistered email: ${email}`,
        });
      }
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    if (user.status === 'suspended') {
      res
        .status(403)
        .json({ success: false, message: 'Account has been suspended by administration' });
      return;
    }
    if (!user.password) {
      res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (isDbConnected()) {
        await AuditLog.create({
          id: `aud-${Date.now()}`,
          eventType: 'FAILED_LOGIN_ATTEMPT',
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          details: `Failed password authentication attempt for user ${user.email}`,
        }).catch(() => {});
      } else {
        dbStore.addAuditLog({
          eventType: 'FAILED_LOGIN_ATTEMPT',
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          details: `Failed password authentication attempt for user ${user.email}`,
        });
      }
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (isDbConnected()) {
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'USER_LOGIN',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `${user.role.toUpperCase()} ${user.name} logged into MediGuide portal.`,
      });
    } else {
      dbStore.addAuditLog({
        eventType: 'USER_LOGIN',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `${user.role.toUpperCase()} ${user.name} logged into MediGuide portal.`,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    if (isDbConnected()) {
      await User.findOneAndUpdate({ id: user.id }, { $set: { refreshToken } });
    } else {
      dbStore.updateUser(user.id, { refreshToken });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      accessToken,
      refreshToken,
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

  let user;
  if (isDbConnected()) {
    user = await User.findOne({
      $or: [
        { email: targetEmail },
        ...(role === 'doctor' ? [{ email: 'dr.priya.sharma@mediguide.com' }] : []),
      ],
    }).lean();
  } else {
    user =
      dbStore.findUserByEmail(targetEmail) ||
      (role === 'doctor' ? dbStore.findUserByEmail('dr.priya.sharma@mediguide.com') : null);
  }

  if (!user) {
    res.status(404).json({ success: false, message: `Demo user for role ${role} not found` });
    return;
  }

  if (isDbConnected()) {
    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'DEMO_LOGIN',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      details: `Demo session initiated as ${user.role} (${user.name}).`,
    });
  } else {
    dbStore.addAuditLog({
      eventType: 'DEMO_LOGIN',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      details: `Demo session initiated as ${user.role} (${user.name}).`,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  if (isDbConnected()) {
    await User.findOneAndUpdate({ id: user.id }, { $set: { refreshToken } });
  } else {
    dbStore.updateUser(user.id, { refreshToken });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: `Logged in as Demo ${user.role.toUpperCase()}`,
    token: accessToken,
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  });
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = refreshTokenSchema.parse(req.body);

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtRefreshSecret);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ id: decoded.id }).lean();
    } else {
      user = dbStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    // Generate new rotated tokens
    const tokens = generateTokens(user);
    if (isDbConnected()) {
      await User.findOneAndUpdate({ id: user.id }, { $set: { refreshToken: tokens.refreshToken } });
    } else {
      dbStore.updateUser(user.id, { refreshToken: tokens.refreshToken });
    }

    return res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    if (userId) {
      if (isDbConnected()) {
        await User.findOneAndUpdate({ id: userId }, { $set: { refreshToken: '' } });
        await AuditLog.create({
          id: `aud-${Date.now()}`,
          eventType: 'USER_LOGOUT',
          actorId: userId,
          actorEmail: req.user?.email || 'N/A',
          actorRole: req.user?.role || 'patient',
          details: `User logged out of MediGuide portal.`,
        });
      } else {
        dbStore.updateUser(userId, { refreshToken: '' });
        dbStore.addAuditLog({
          eventType: 'USER_LOGOUT',
          actorId: userId,
          actorEmail: req.user?.email || 'N/A',
          actorRole: req.user?.role || 'patient',
          details: `User logged out of MediGuide portal.`,
        });
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during logout' });
  }
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

  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updates = {};
    for (const [key, val] of Object.entries(validatedData)) {
      if (val !== undefined) {
        updates[key] = val;
      }
    }

    if (isDbConnected()) {
      const updatedUser = await User.findOneAndUpdate(
        { id: req.user.id },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'PROFILE_UPDATED',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: `User ${req.user.name} updated profile details.`,
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword,
      });
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() }).lean();
    } else {
      user = dbStore.findUserByEmail(email);
    }

    if (!user) {
      res.json({
        success: true,
        message:
          'If an account exists with this email, password reset instructions and OTP (Default demo OTP: 123456) have been sent.',
      });
      return;
    }

    if (isDbConnected()) {
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'PASSWORD_RESET_REQUEST',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `Password reset OTP requested for ${user.email}.`,
      });
    } else {
      dbStore.addAuditLog({
        eventType: 'PASSWORD_RESET_REQUEST',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `Password reset OTP requested for ${user.email}.`,
      });
    }

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

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() }).lean();
    } else {
      user = dbStore.findUserByEmail(email);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (otp !== '123456' && otp !== '999999') {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isDbConnected()) {
      await User.findOneAndUpdate({ id: user.id }, { $set: { password: hashedPassword } });
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'PASSWORD_RESET_SUCCESS',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `Password was successfully updated for ${user.email}.`,
      });
    } else {
      dbStore.updateUser(user.id, { password: hashedPassword });
      dbStore.addAuditLog({
        eventType: 'PASSWORD_RESET_SUCCESS',
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: `Password was successfully updated for ${user.email}.`,
      });
    }

    res.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const getDemoAccounts = async (_req, res) => {
  res.json({
    success: true,
    demoAccounts: [
      {
        role: 'patient',
        title: 'Patient Account',
        name: 'Aarav Patel (Bengaluru)',
        email: 'patient@mediguide.com',
        description:
          'Experience AI symptom checking, medicine adherence tracking, doctor booking in IST, and digital document vault.',
      },
      {
        role: 'doctor',
        title: 'Doctor Account',
        name: 'Dr. Priya Sharma (MD, AIIMS New Delhi)',
        email: 'dr.priya.sharma@mediguide.com',
        description:
          'Manage patient consultations, configure availability schedules, write structured digital prescriptions with downloadable PDF.',
      },
      {
        role: 'admin',
        title: 'Admin Account',
        name: 'MediGuide Administrator (Platform Administrator)',
        email: 'admin@mediguide.com',
        description:
          'Oversee healthcare platform metrics, approve doctor credentials, manage medical departments, inspect security audit trails.',
      },
    ],
  });
};
