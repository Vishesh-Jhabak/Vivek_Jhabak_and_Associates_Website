const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedData = async () => {
  try {
    console.log('Connecting to Supabase...');
    
    // 1. Clean existing records in tables using timezone/creation bounds
    console.log('Clearing database tables...');
    const epoch = '1970-01-01T00:00:00Z';
    
    // Clear relations first due to foreign keys
    await supabase.from('applicants').delete().gte('applied_at', epoch);
    await supabase.from('appointments').delete().gte('created_at', epoch);
    await supabase.from('messages').delete().gte('created_at', epoch);
    await supabase.from('jobs').delete().gte('created_at', epoch);
    await supabase.from('pricing').delete().gte('created_at', epoch);
    await supabase.from('services').delete().gte('created_at', epoch);

    console.log('Tables cleared.');

    // 2. Seed Services
    console.log('Seeding CA Services...');
    const { data: services, error: svcError } = await supabase.from('services').insert([
      {
        name: 'Income Tax Return (ITR) Filing',
        description: 'Complete ITR preparation and electronic filing for individuals, salaried employees, HNIs, partnership firms, and companies. Ensures accurate deductions and filings.',
        price: 1500,
        category: 'Taxation',
        icon: 'percent',
        status: 'active',
      },
      {
        name: 'GST Registration & Return Filing',
        description: 'New GST registration setup, monthly and quarterly return filing, GSTR-1, GSTR-3B, annual returns GSTR-9, and reconciliation of Input Tax Credit (GSTR-2B).',
        price: 2500,
        category: 'Taxation',
        icon: 'shopping-cart',
        status: 'active',
      },
      {
        name: 'Statutory Audit & Tax Audit',
        description: 'Independent statutory audits for corporate entities and Tax Audits under Section 44AB of the Income Tax Act. Thorough checking of records and financial statements.',
        price: 15000,
        category: 'Audit & Assurance',
        icon: 'shield',
        status: 'active',
      },
      {
        name: 'Company Incorporation & ROC Compliance',
        description: 'Incorporate Private Limited companies, LLPs, or One Person Companies (OPC). Management of annual ROC filing, active forms, and company secretarial resolutions.',
        price: 8000,
        category: 'Corporate Advisory',
        icon: 'briefcase',
        status: 'active',
      },
      {
        name: 'Project Report & Bank Loan Syndication',
        description: 'Preparation of detailed project reports, CMA data projections, and consulting for bank loan approvals, CC limits, term loans, and SME finance.',
        price: 10000,
        category: 'Financial Services',
        icon: 'trending-up',
        status: 'active',
      }
    ]).select();

    if (svcError) throw svcError;
    console.log(`${services.length} services seeded successfully.`);

    // 3. Seed Pricing Plans
    console.log('Seeding Pricing plans...');
    const { data: pricingPlans, error: prcError } = await supabase.from('pricing').insert([
      {
        name: 'Individual Tax Starter',
        description: 'Ideal for salaried professionals, pensioners, and single-source income earners.',
        price: '₹1,499 / filing',
        features: [
          'ITR-1 Form Preparation',
          'Salary, House Property & Interest Income',
          'Tax Savings & Deductions Optimization (80C, 80D)',
          'E-Filing & Verification'
        ],
        category: 'Individual',
        status: 'active',
      },
      {
        name: 'Business GST Standard',
        description: 'Comprehensive monthly taxation and filing support for small businesses and shopkeepers.',
        price: '₹2,499 / month',
        features: [
          'Monthly GST Return Filing (GSTR-1 & 3B)',
          'Input Tax Credit (ITC) Reconciliation',
          'Basic Tax Advisory (Up to 2 hours/month)',
          'E-Way Bill consultancy'
        ],
        category: 'SME Business',
        status: 'active',
      },
      {
        name: 'Corporate Assurance & Compliance',
        description: 'Complete annual package for Private Limited Companies and LLPs covering statutory audits and filings.',
        price: '₹29,999 / onwards',
        features: [
          'Statutory Financial Audit',
          'Income Tax Audit & ITR-6 Filing',
          'Annual ROC Filing (AOC-4 & MGT-7)',
          'Director KYC filings & Board Resolutions support'
        ],
        category: 'Corporate',
        status: 'active',
      }
    ]).select();

    if (prcError) throw prcError;
    console.log(`${pricingPlans.length} pricing plans seeded successfully.`);

    // 4. Seed Job Vacancies
    console.log('Seeding Job vacancies...');
    const { data: jobs, error: jobError } = await supabase.from('jobs').insert([
      {
        title: 'Chartered Accountant (Associate)',
        department: 'Taxation & Auditing',
        description: 'Looking for a qualified Chartered Accountant to manage a portfolio of clients. Responsible for conducting statutory audits, preparing tax audit reports, and handling complex income tax assessments.',
        requirements: [
          'Qualified CA (Member of ICAI)',
          '1-3 years of post-qualification experience in a similar firm profile',
          'Expertise in Tally, MS Excel, and online filing portals',
          'Deep knowledge of Income Tax Act and GST regulations'
        ],
        type: 'Full-time',
        location: 'Nawapara, Rajim office',
        status: 'open',
      },
      {
        title: 'Articled Assistant (IPCC Cleared)',
        department: 'Audit & Compliance',
        description: 'Vacancy for Article Trainees who have cleared either or both groups of IPCC/Intermediate. Offers a rich, hands-on learning environment covering statutory audits, bank audits, internal audits, and filing compliance.',
        requirements: [
          'Cleared IPCC / Intermediate (Group-1 or both)',
          'Strong academic record and analytical skills',
          'Willingness to learn and travel for outstation client audits',
          'Basic proficiency in computer applications'
        ],
        type: 'Internship',
        location: 'Nawapara, Rajim office',
        status: 'open',
      }
    ]).select();

    if (jobError) throw jobError;
    console.log(`${jobs.length} vacancies seeded successfully.`);

    console.log('\n=========================================');
    console.log('SUPABASE DATABASE SEED COMPLETED SUCCESSFULLY! 🎉');
    console.log('=========================================\n');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
