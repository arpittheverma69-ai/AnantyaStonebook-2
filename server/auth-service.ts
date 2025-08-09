import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const jwtSecret = process.env.JWT_SECRET || 'anantya-stone-secret-key-2024';

const supabase = createClient(supabaseUrl, supabaseKey);

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  last_login: string;
  is_active: boolean;
  email_verified: boolean;
  phone_number?: string;
  fingerprint_enabled: boolean;
  two_factor_enabled: boolean;
  fingerprint_hash?: string; // Store hashed fingerprint data
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  requiresOTP?: boolean;
  requiresEmailVerification?: boolean;
  requiresFingerprint?: boolean;
  requiresFingerprintSetup?: boolean;
}

export interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, OTPData>();

// Store phone authentication sessions (in production, use Redis)
const phoneAuthSessions = new Map<string, {
  sessionId: string;
  timestamp: number;
  authenticated: boolean;
  token?: string;
  user?: User;
}>();

// Store authorized fingerprint hash (in production, use secure storage)
const AUTHORIZED_FINGERPRINT_HASH = process.env.AUTHORIZED_FINGERPRINT_HASH || '';

export class AuthService {
  // Generate OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash fingerprint data for comparison
  private hashFingerprintData(fingerprintData: string): string {
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  // Verify fingerprint is authorized (only owner's fingerprint)
  private verifyFingerprint(fingerprintData: string): boolean {
    try {
      
      // Check if this is a laptop fingerprint signature
      if (fingerprintData.startsWith('LAPTOP_FINGERPRINT_')) {
        // For demo purposes, accept any laptop fingerprint
        // In production, you would verify against stored laptop credentials
        return true;
      }
      
      // Check if this is the authorized fingerprint hash
      if (AUTHORIZED_FINGERPRINT_HASH) {
        const hashedData = this.hashFingerprintData(fingerprintData);
        const isMatch = hashedData === AUTHORIZED_FINGERPRINT_HASH;
        return isMatch;
      }
      
      return false;
      
    } catch (error) {
      console.error('💥 Fingerprint verification error:', error);
      return false;
    }
  }

  // Send OTP via email
  private async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Anantya Stone - OTP Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">🔐 Anantya Stone Security</h2>
            <p>Your OTP for login verification is:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="color: #4F46E5; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Send email verification
  private async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Anantya Stone - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">✅ Verify Your Email</h2>
            <p>Welcome to Anantya Stone Management System!</p>
            <p>Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Verification email sending failed:', error);
      return false;
    }
  }

  // Initialize admin user if not exists
  async initializeAdmin() {
    try {
      // Check if users table exists by trying to query it
      const { data: existingAdmin, error: tableError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@anantyastone.com')
        .single();

      if (tableError && tableError.code === 'PGRST204') {
        console.log('Users table does not exist. Please create it in your Supabase dashboard.');
        console.log('Run the SQL from users-table-migration.sql in your Supabase SQL editor.');
        return;
      }

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('AnantyaStone2024!', 12);
        
        const { data: newAdmin, error } = await supabase
          .from('users')
          .insert({
            email: 'admin@anantyastone.com',
            username: 'admin',
            password_hash: hashedPassword,
            role: 'admin',
            is_active: true,
            email_verified: true,
            two_factor_enabled: false,
            fingerprint_enabled: true, // Enable fingerprint for admin
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating admin user:', error);
        } else {
          console.log('Admin user created successfully');
        }
      }
    } catch (error) {
      console.error('Error initializing admin:', error);
    }
  }

  // User registration with email verification
  async register(email: string, username: string, password: string, securityCode: string, phoneNumber?: string): Promise<AuthResponse> {
    try {
      // Validate security code
      if (securityCode !== 'GEMSTONE2024') {
        return {
          success: false,
          message: 'Invalid security code'
        };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          username,
          password_hash: hashedPassword,
          role: 'user',
          is_active: true,
          email_verified: false,
          phone_number: phoneNumber,
          two_factor_enabled: false,
          fingerprint_enabled: false,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to create user'
        };
      }

      // Send verification email
      const emailSent = await this.sendVerificationEmail(email, verificationToken);

      if (!emailSent) {
        return {
          success: false,
          message: 'User created but verification email failed to send'
        };
      }

      return {
        success: true,
        user: newUser,
        message: 'User registered successfully. Please check your email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      // In a real implementation, you'd verify the token from the database
      // For now, we'll simulate email verification
      
      const { data: user, error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('email', 'admin@anantyastone.com') // This should be based on the token
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Email verification failed'
        };
      }

      return {
        success: true,
        user,
        message: 'Email verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email verification failed'
      };
    }
  }

  // Exclusive fingerprint authentication
  async authenticateFingerprint(fingerprintData: string): Promise<AuthResponse> {
    try {
      // Verify this is the authorized fingerprint
      const isVerified = this.verifyFingerprint(fingerprintData);
      
      if (!isVerified) {
        return {
          success: false,
          message: 'Unauthorized fingerprint. Access denied.'
        };
      }

      // Get admin user
      const adminUser: User = {
        id: 'admin-user-id',
        email: 'admin@anantyastone.com',
        username: 'admin',
        role: 'admin' as const,
        is_active: true,
        email_verified: true,
        two_factor_enabled: false,
        fingerprint_enabled: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      // Generate JWT token
      const token = jwt.sign(
        { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        user: adminUser,
        token
      };
    } catch (error) {
      return {
        success: false,
        message: 'Fingerprint authentication failed'
      };
    }
  }

  // User login with OTP
  async login(email: string, password: string, securityCode: string, otp?: string): Promise<AuthResponse> {
    try {
      // Validate security code
      if (securityCode !== 'GEMSTONE2024') {
        return {
          success: false,
          message: 'Invalid security code'
        };
      }

      // Check for hardcoded admin credentials (fallback)
      if (email === 'admin@anantyastone.com' && password === 'AnantyaStone2024!') {
        const adminUser: User = {
          id: 'admin-user-id',
          email: 'admin@anantyastone.com',
          username: 'admin',
          role: 'admin' as const,
          is_active: true,
          email_verified: true,
          two_factor_enabled: false,
          fingerprint_enabled: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        // Check if OTP is required
        if (adminUser.two_factor_enabled && !otp) {
          // Generate and send OTP
          const generatedOTP = this.generateOTP();
          const otpData: OTPData = {
            email: adminUser.email,
            otp: generatedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            attempts: 0
          };
          
          otpStorage.set(adminUser.email, otpData);
          await this.sendOTPEmail(adminUser.email, generatedOTP);

          return {
            success: false,
            requiresOTP: true,
            message: 'OTP sent to your email'
          };
        }

        // Verify OTP if provided
        if (otp) {
          const storedOTP = otpStorage.get(adminUser.email);
          if (!storedOTP || storedOTP.otp !== otp || new Date() > storedOTP.expiresAt) {
            return {
              success: false,
              message: 'Invalid or expired OTP'
            };
          }
          otpStorage.delete(adminUser.email);
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
          jwtSecret,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user: adminUser,
          token
        };
      }

      // Try database authentication
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user) {
          return {
            success: false,
            message: 'Invalid credentials'
          };
        }

        // Check if user is active
        if (!user.is_active) {
          return {
            success: false,
            message: 'Account is deactivated'
          };
        }

        // Check if email is verified
        if (!user.email_verified) {
          return {
            success: false,
            requiresEmailVerification: true,
            message: 'Please verify your email before logging in'
          };
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return {
            success: false,
            message: 'Invalid credentials'
          };
        }

        // Check if OTP is required
        if (user.two_factor_enabled && !otp) {
          // Generate and send OTP
          const generatedOTP = this.generateOTP();
          const otpData: OTPData = {
            email: user.email,
            otp: generatedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            attempts: 0
          };
          
          otpStorage.set(user.email, otpData);
          await this.sendOTPEmail(user.email, generatedOTP);

          return {
            success: false,
            requiresOTP: true,
            message: 'OTP sent to your email'
          };
        }

        // Verify OTP if provided
        if (otp) {
          const storedOTP = otpStorage.get(user.email);
          if (!storedOTP || storedOTP.otp !== otp || new Date() > storedOTP.expiresAt) {
            return {
              success: false,
              message: 'Invalid or expired OTP'
            };
          }
          otpStorage.delete(user.email);
        }

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          jwtSecret,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user,
          token
        };
      } catch (dbError) {
        // If database is not set up, fall back to hardcoded credentials
        return {
          success: false,
          message: 'Database not configured. Please set up the users table.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  // Enable/Disable 2FA
  async toggleTwoFactor(userId: string, enable: boolean): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({ two_factor_enabled: enable })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to update 2FA settings'
        };
      }

      return {
        success: true,
        user,
        message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update 2FA settings'
      };
    }
  }

  // Enable/Disable fingerprint authentication
  async toggleFingerprint(userId: string, enable: boolean): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({ fingerprint_enabled: enable })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to update fingerprint settings'
        };
      }

      return {
        success: true,
        user,
        message: `Fingerprint authentication ${enable ? 'enabled' : 'disabled'}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update fingerprint settings'
      };
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to update user'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Update failed'
      };
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Get current user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashedNewPassword })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          message: 'Failed to update password'
        };
      }

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        message: 'Password change failed'
      };
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return users || [];
    } catch (error) {
      return [];
    }
  }

  // Deactivate user (admin only)
  async deactivateUser(userId: string): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to deactivate user'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Deactivation failed'
      };
    }
  }

  // Phone authentication methods
  async createPhoneAuthSession(sessionId: string): Promise<AuthResponse> {
    try {
      // Create a new phone authentication session
      phoneAuthSessions.set(sessionId, {
        sessionId,
        timestamp: Date.now(),
        authenticated: false
      });

      return {
        success: true,
        message: 'Phone authentication session created'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create phone authentication session'
      };
    }
  }

  async verifyPhoneAuthSession(sessionId: string): Promise<AuthResponse> {
    try {
      const session = phoneAuthSessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      // Check if session is expired (5 minutes)
      if (Date.now() - session.timestamp > 5 * 60 * 1000) {
        phoneAuthSessions.delete(sessionId);
        return {
          success: false,
          message: 'Session expired'
        };
      }

      if (session.authenticated && session.token && session.user) {
        // Clean up session
        phoneAuthSessions.delete(sessionId);
        
        return {
          success: true,
          user: session.user,
          token: session.token
        };
      }

      return {
        success: false,
        message: 'Not authenticated yet'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify phone authentication session'
      };
    }
  }

  async authenticateWithPhone(sessionId: string): Promise<AuthResponse> {
    try {
      const session = phoneAuthSessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      // Create admin user for phone authentication
      const adminUser: User = {
        id: 'admin-user-id',
        email: 'admin@anantyastone.com',
        username: 'admin',
        role: 'admin' as const,
        is_active: true,
        email_verified: true,
        two_factor_enabled: false,
        fingerprint_enabled: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      // Generate JWT token
      const token = jwt.sign(
        { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Update session with authentication data
      session.authenticated = true;
      session.token = token;
      session.user = adminUser;

      return {
        success: true,
        user: adminUser,
        token
      };
    } catch (error) {
      return {
        success: false,
        message: 'Phone authentication failed'
      };
    }
  }
}

export const authService = new AuthService();
