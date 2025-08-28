import express from 'express';
import { getSupabase } from '../config/supabase.js';

const router = express.Router();

// Mock company data for development
const mockCompanies = [
  {
    id: 'acme-corp',
    name: 'ACME Corporation',
    domain: 'acme.com',
    companyReference: 'acme', // This matches the ImageKit folder naming: acme-logo.png
    brandColors: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      gradient: ['#1e40af', '#3b82f6', '#60a5fa']
    }
  },
  {
    id: 'techcorp',
    name: 'TechCorp Industries',
    domain: 'techcorp.com',
    companyReference: 'techcorp', // This matches: techcorp-logo.png
    brandColors: {
      primary: '#059669',
      secondary: '#047857',
      gradient: ['#065f46', '#059669', '#10b981']
    }
  },
  {
    id: 'globalltd',
    name: 'Global Ltd',
    domain: 'global.com',
    companyReference: 'global', // This matches: global-logo.png
    brandColors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      gradient: ['#991b1b', '#dc2626', '#ef4444']
    }
  },
  {
    id: 'splitfin',
    name: 'Splitfin',
    domain: 'splitfin.com',
    companyReference: 'splitfin', // This matches: splitfin-logo.png
    brandColors: {
      primary: '#79d5e9',
      secondary: '#6bc7db',
      gradient: ['#4daebc', '#79d5e9', '#89dce6']
    }
  },
  {
    id: 'dmbrands',
    name: 'DM Brands',
    domain: 'dmbrands.com',
    companyReference: 'dmbrands', // This matches: dmbrands-logo.png
    brandColors: {
      primary: '#4a3046',
      secondary: '#685164',
      gradient: ['#4a3046', '#685164', '#8a7084']
    }
  }
];

// Get company by domain (for dynamic branding)
router.get('/by-domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    const supabase = getSupabase();
    let company = null;

    if (supabase) {
      // Use Supabase to fetch company
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('domain', domain.toLowerCase())
        .single();

      if (error) {
        console.log('Company not found in database:', domain);
        return res.status(404).json({ message: 'Company not found' });
      }

      company = data;
    } else {
      // Use mock data for development
      company = mockCompanies.find(c => c.domain.toLowerCase() === domain.toLowerCase());
      
      if (!company) {
        console.log('Company not found in mock data:', domain);
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    res.json(company);

  } catch (error) {
    console.error('Company lookup error:', error);
    res.status(500).json({ message: 'Failed to fetch company information' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supabase = getSupabase();
    let company = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ message: 'Company not found' });
      }

      company = data;
    } else {
      company = mockCompanies.find(c => c.id === id);
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    res.json(company);

  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch company information' });
  }
});

export default router;