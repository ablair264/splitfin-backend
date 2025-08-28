import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase.js';

const router = express.Router();

// Mock data for development (remove when Supabase is connected)
const mockUsers = [
  {
    id: '1',
    email: 'manager@acme.com',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8', // 'password123'
    firstName: 'John',
    lastName: 'Manager',
    role: 'Manager',
    companyId: 'acme-corp',
    permissions: {
      analytics: true,
      orders: true,
      customers: true,
      finance: true,
      purchasing: true,
      inventory: true,
      salesManagement: true,
      customerManagement: true,
      catalogues: true,
      imageManagement: true,
      marketing: true
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'admin@acme.com',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8',
    firstName: 'Jane',
    lastName: 'Admin',
    role: 'Admin',
    companyId: 'acme-corp',
    permissions: {
      analytics: true,
      orders: true,
      customers: true,
      finance: true,
      purchasing: true,
      inventory: true,
      salesManagement: false,
      customerManagement: true,
      catalogues: true,
      imageManagement: true,
      marketing: false
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'sales@acme.com',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8',
    firstName: 'Bob',
    lastName: 'Sales',
    role: 'Sales',
    companyId: 'acme-corp',
    permissions: {
      analytics: false,
      orders: true,
      customers: true,
      finance: false,
      purchasing: false,
      inventory: true,
      salesManagement: false,
      customerManagement: false,
      catalogues: true,
      imageManagement: false,
      marketing: false
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'customer@acme.com',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8',
    firstName: 'Alice',
    lastName: 'Customer',
    role: 'Customer',
    companyId: 'acme-corp',
    permissions: {
      analytics: false,
      orders: true,
      customers: false,
      finance: false,
      purchasing: false,
      inventory: false,
      salesManagement: false,
      customerManagement: false,
      catalogues: true,
      imageManagement: false,
      marketing: false
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    email: 'manager@dmbrands.com',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8',
    firstName: 'David',
    lastName: 'Manager',
    role: 'Manager',
    companyId: 'dmbrands',
    permissions: {
      analytics: true,
      orders: true,
      customers: true,
      finance: true,
      purchasing: true,
      inventory: true,
      salesManagement: true,
      customerManagement: true,
      catalogues: true,
      imageManagement: true,
      marketing: true
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    email: 'manager@dmbrands.co.uk',
    password: '$2a$10$rOzJqQMYw5YfFhj3fPkUJuFo8W8F8W8F8W8F8W8F8W8F8W8F8W8',
    firstName: 'David',
    lastName: 'Manager',
    role: 'Manager',
    companyId: 'dmbrands-uk',
    permissions: {
      analytics: true,
      orders: true,
      customers: true,
      finance: true,
      purchasing: true,
      inventory: true,
      salesManagement: true,
      customerManagement: true,
      catalogues: true,
      imageManagement: true,
      marketing: true
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockCompanies = [
  {
    id: 'acme-corp',
    name: 'ACME Corporation',
    domain: 'acme.com',
    companyReference: 'acme',
    brandColors: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      gradient: ['#1e40af', '#3b82f6', '#60a5fa']
    }
  },
  {
    id: 'dmbrands',
    name: 'DM Brands',
    domain: 'dmbrands.com',
    companyReference: 'dmbrands',
    brandColors: {
      primary: '#4a3046',
      secondary: '#685164',
      gradient: ['#4a3046', '#685164', '#8a7084']
    }
  },
  {
    id: 'dmbrands-uk',
    name: 'DM Brands UK',
    domain: 'dmbrands.co.uk',
    companyReference: 'dmbrands',
    brandColors: {
      primary: '#4a3046',
      secondary: '#685164',
      gradient: ['#4a3046', '#685164', '#8a7084']
    }
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const supabase = getSupabase();
    let user = null;
    let company = null;

    if (supabase) {
      // Use Supabase for authentication
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, companies(*)')
        .eq('email', email.toLowerCase())
        .eq('isActive', true)
        .single();

      if (userError || !userData) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      user = userData;
      company = userData.companies;
    } else {
      // Use mock data for development
      user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      company = mockCompanies.find(c => c.id === user.companyId);
    }

    if (!company) {
      return res.status(500).json({ message: 'Company information not found' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Update last login if using Supabase
    if (supabase) {
      await supabase
        .from('users')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', user.id);
    }

    res.json({
      user: userWithoutPassword,
      company,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Token validation endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const supabase = getSupabase();
    let user = null;

    if (supabase) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*, companies(*)')
        .eq('id', decoded.userId)
        .eq('isActive', true)
        .single();

      if (error || !userData) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      user = userData;
    } else {
      user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;