import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

export default function Home() {
  // Data States
  const [services, setServices] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search State
  const [serviceSearch, setServiceSearch] = useState('');

  // Form States - Appointment
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    timeSlot: '10:00 AM - 11:00 AM',
    notes: '',
  });
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSuccess, setApptSuccess] = useState('');
  const [apptError, setApptError] = useState('');

  // Form States - Contact Form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  // Form States - Career Application Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [careerForm, setCareerForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [careerSubmitting, setCareerSubmitting] = useState(false);
  const [careerSuccess, setCareerSuccess] = useState('');
  const [careerError, setCareerError] = useState('');

  // Back to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dynamic Time Slots
  const availableSlots = [
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
  ];

  // Load public data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, pricingRes, jobsRes] = await Promise.all([
          api.getServices(false),
          api.getPricing(false),
          api.getJobs(false),
        ]);

        if (servicesRes.success) setServices(servicesRes.data);
        if (pricingRes.success) setPricingPlans(pricingRes.data);
        if (jobsRes.success) setVacancies(jobsRes.data);
      } catch (err) {
        console.error('Error fetching public content:', err.message);
        // Fallbacks for offline development
        setServices([
          { id: '1', name: 'Income Tax Return (ITR) Filing', description: 'Optimized preparation and electronic filing for individuals & corporates.', price: 1500, category: 'Taxation', icon: 'percent' },
          { id: '2', name: 'GST Registration & Return Filing', description: 'End-to-end GST setups, monthly GSTR-1/3B filing, and input reconciliations.', price: 2500, category: 'Taxation', icon: 'shopping-cart' },
          { id: '3', name: 'Statutory & Tax Audit', description: 'Independent auditing services ensuring audit reports section 44AB transparency.', price: 15000, category: 'Audit', icon: 'shield' },
          { id: '4', name: 'Company Registration', description: 'Seamless incorporation of LLPs, OPCs, and Private Limited companies.', price: 8000, category: 'Corporate', icon: 'corporate_fare' },
        ]);
        setPricingPlans([
          { id: '1', name: 'Individual Filing Starter', description: 'Ideal for salaried professionals & single source earners.', price: '₹1,499 / filing', features: ['ITR-1 Form Filing', 'Salary & Interest Income', '80C & Deductions advice', 'E-Verification Support'], category: 'Individual' },
          { id: '2', name: 'Business GST Standard', description: 'Monthly tax filings and accounting support for shopkeepers.', price: '₹2,499 / month', features: ['GSTR-1 & 3B Monthly filings', 'ITC Reconciliation', 'Tax Consultation', 'E-Way bill advisory'], category: 'Business' },
        ]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();

    // Scroll listener for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update default service selection once services load
  useEffect(() => {
    if (services.length > 0 && !appointmentForm.service) {
      setAppointmentForm((prev) => ({ ...prev, service: services[0].id }));
    }
  }, [services]);

  // Filters services based on live search query
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Form Submissions - Appointment
  const handleApptSubmit = async (e) => {
    e.preventDefault();
    setApptSubmitting(true);
    setApptSuccess('');
    setApptError('');

    try {
      const res = await api.bookAppointment(appointmentForm);
      if (res.success) {
        setApptSuccess('Appointment request submitted successfully! A confirmation email is on its way.');
        setAppointmentForm({
          name: '',
          email: '',
          phone: '',
          service: services[0]?.id || '',
          date: '',
          timeSlot: '10:00 AM - 11:00 AM',
          notes: '',
        });
      }
    } catch (err) {
      setApptError(err.message || 'Failed to submit booking. Slot might already be taken.');
    } finally {
      setApptSubmitting(false);
    }
  };

  // Form Submissions - Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactSuccess('');
    setContactError('');

    try {
      const res = await api.submitContactForm(contactForm);
      if (res.success) {
        setContactSuccess('Your message was sent successfully. We will get back to you shortly!');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
        });
      }
    } catch (err) {
      setContactError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Form Submissions - Careers / Resume Application
  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setCareerError('Please attach your PDF resume.');
      return;
    }

    setCareerSubmitting(true);
    setCareerSuccess('');
    setCareerError('');

    const formData = new FormData();
    formData.append('name', careerForm.name);
    formData.append('email', careerForm.email);
    formData.append('phone', careerForm.phone);
    formData.append('notes', careerForm.notes);
    formData.append('job', selectedJob.id);
    formData.append('resume', resumeFile);

    try {
      const res = await api.applyForJob(formData);
      if (res.success) {
        setCareerSuccess('Application submitted successfully! Our HR team will review your resume.');
        setCareerForm({ name: '', email: '', phone: '', notes: '' });
        setResumeFile(null);
        setTimeout(() => {
          setSelectedJob(null);
          setCareerSuccess('');
        }, 3000);
      }
    } catch (err) {
      setCareerError(err.message || 'Failed to submit application.');
    } finally {
      setCareerSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-brand-gold/20 custom-scrollbar overflow-x-hidden">
      
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/30 px-6 md:px-margin-desktop py-4 flex justify-between items-center h-20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-brand-gold">account_balance</span>
          <div className="font-headline-sm text-[20px] md:text-headline-sm text-on-surface tracking-tight font-bold">
            Vivek Jhabak & Associates
          </div>
        </div>
        <div className="hidden md:flex gap-gutter items-center">
          <button onClick={() => scrollToSection('about')} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300">About</button>
          <button onClick={() => scrollToSection('services')} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300">Services</button>
          <button onClick={() => scrollToSection('pricing')} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300">Pricing</button>
          <button onClick={() => scrollToSection('careers')} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300">Careers</button>
          <button onClick={() => scrollToSection('contact')} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300">Contact</button>
          <Link to="/login" className="font-label-md text-label-md text-brand-gold hover:underline transition-all">Admin Dashboard</Link>
          <button 
            onClick={() => scrollToSection('appointment')}
            className="bg-brand-gold text-white px-6 py-2 ml-4 font-label-md text-label-md hover:bg-brand-gold/90 transition-all font-semibold uppercase tracking-wider"
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 md:px-margin-desktop overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 opacity-5 grayscale pointer-events-none">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLv9Y5G9hJWiDN8IiYYrLrDjJALmaxWmU2UG7O9Uj4DISzLnG8igPvPO1jrIxH7o6l_KnOpC-cfcMIo4FvRiWUaBBPLAYkhqVeDoCRGzOg-8qgOnLf0-hC53u9_SxRGSUhmAKutBCnxk9aF0jtQEMlyKvNpTvUTABXX7xyhOfl-fmsaVg_nNWhs7d2MrEbFJKzKB4Kxfq2Zzpc34CLV1SZGQuXxQ8HCyKUuFZ6T4FM_r_zcfhBrEEN_EWUs"
            alt="Vivek Jhabak & Associates Office"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white z-1"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto space-y-12"
        >
          <div className="space-y-6">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.3em] text-brand-gold block font-semibold">Excellence in Finance</span>
            <h1 className="font-display-lg text-4xl md:text-[80px] text-on-surface leading-[1.1] text-balance font-bold">
              Your Trusted Chartered Accountant Since 20+ Years
            </h1>
            <p className="font-body-lg text-lg md:text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Expert Financial, Taxation &amp; Compliance Services designed for elite professionals and growing enterprises.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => scrollToSection('appointment')}
              className="w-full sm:w-auto bg-brand-gold text-white px-10 py-5 font-label-md text-label-md uppercase tracking-widest shadow-xl shadow-brand-gold/10 hover:translate-y-[-2px] transition-transform font-bold"
            >
              Book Appointment
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="w-full sm:w-auto border border-brand-gold text-on-surface px-10 py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-brand-gold/5 transition-colors font-bold"
            >
              Explore Services
            </button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-section-gap px-6 md:px-margin-desktop max-w-container-max mx-auto" id="about">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="font-headline-lg text-headline-lg editorial-border pb-6 font-bold">Legacy of Precision</h2>
            <div className="space-y-6 text-on-surface-variant">
              <p className="font-body-lg text-lg leading-relaxed">
                At Vivek Jhabak &amp; Associates, we don't just balance books; we architect financial security. With over two decades of experience in the Nawapara region, our firm has become synonymous with unwavering integrity and strategic brilliance.
              </p>
              <p className="font-body-md text-body-md leading-relaxed">
                We serve as the bridge between complex regulatory requirements and your business's seamless growth, providing bespoke solutions in audit, tax, and corporate advisory.
              </p>
            </div>
            
            {/* Quick Stat Anchors */}
            <div className="flex gap-12 pt-8">
              <div className="space-y-2">
                <div className="font-display-lg text-5xl text-brand-gold font-bold">20+</div>
                <div className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">Years Experience</div>
              </div>
              <div className="space-y-2">
                <div className="font-display-lg text-5xl text-brand-gold font-bold">1k+</div>
                <div className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">Happy Clients</div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 border border-brand-gold/20 translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
            <div className="aspect-[4/5] bg-surface-container overflow-hidden">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZf80L5tL_u3WhBOcO1h_AZXmaxLDF2gmH8dGq9weeYaaKimNAh2iFhyLm7Dxh_ibBj1KYpItqAvg5BJCKarJjwd6J7XCm08QSU0Ah_AwC3L1ygbTrrVC45ZGOOs5nY5Dpy74L2hqISpjxIr25kJ_YS7PD6SDvEnGSArmAcIlcqhEBUAr--PRJL8py6rCPpfVSGxGUUPWt9NS-6AYhlBsB1QUnqIDV2sAaeGIlsUhWD2LzrB4afuo-"
                alt="Elite CA Office Workspace"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Services Grid (With Live Search) */}
      <section className="py-section-gap bg-surface-container-lowest" id="services">
        <div className="px-6 md:px-margin-desktop max-w-container-max mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg font-bold">Comprehensive Services</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Meticulous handling of every financial touchpoint, from individual filings to corporate compliance.
            </p>
            
            {/* Live Search Input */}
            <div className="pt-6 relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px] text-outline">search</span>
              </div>
              <input
                type="text"
                placeholder="Search taxation, audit, GST compliance..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-outline-variant bg-surface-bright focus:border-brand-gold focus:ring-0 rounded-none font-body-md text-sm transition-colors"
              />
              {serviceSearch && (
                <button 
                  onClick={() => setServiceSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center font-label-sm text-xs text-outline hover:text-brand-gold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, idx) => (
                <motion.div 
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-10 border border-outline-variant/30 hover:border-brand-gold transition-colors duration-500 group bg-white flex flex-col justify-between"
                >
                  <div>
                    <span className="material-symbols-outlined text-[40px] mb-8 block">
                      {service.icon || 'star'}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm mb-4 font-bold">{service.name}</h3>
                    <p className="font-body-md text-on-surface-variant mb-6 text-sm line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                    <span className="font-label-sm text-xs text-brand-gold font-bold uppercase tracking-wider">
                      {service.category}
                    </span>
                    <button 
                      onClick={() => {
                        setAppointmentForm(prev => ({ ...prev, service: service.id }));
                        scrollToSection('appointment');
                      }}
                      className="font-label-md text-xs text-on-surface hover:text-brand-gold flex items-center gap-1 font-bold transition-all uppercase tracking-wider"
                    >
                      Book Consult <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white border border-dashed border-outline-variant/50">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">find_in_page</span>
                <p className="font-body-md text-on-surface-variant">No matching services found. Try typing another keyword.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section className="py-section-gap px-6 md:px-margin-desktop max-w-container-max mx-auto" id="pricing">
        <div className="space-y-16">
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg mb-4 font-bold">Transparent Investment</h2>
            <p className="font-body-md text-on-surface-variant">
              Elite-tier financial counsel at clear, upfront rates. No hidden fees, just pure professional value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-gutter">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={plan.id || idx}
                className={`p-12 bg-white border space-y-8 flex flex-col ${
                  idx === 1 ? 'border-2 border-brand-gold shadow-2xl shadow-brand-gold/5 relative' : 'border-outline-variant/20'
                }`}
              >
                {idx === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-white px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
                    MOST POPULAR
                  </div>
                )}
                <div className="space-y-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-label-md font-label-md text-on-surface-variant uppercase text-xs">From</span>
                    <span className="font-display-lg text-[32px] text-brand-gold font-bold">{plan.price}</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed italic">{plan.description}</p>
                <ul className="space-y-4 font-body-md text-on-surface-variant flex-grow text-sm border-t border-outline-variant/10 pt-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-brand-gold flex-shrink-0"></span> 
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    const matchedService = services.find(s => s.name.toLowerCase().includes(plan.name.split(' ')[0].toLowerCase()));
                    if (matchedService) {
                      setAppointmentForm(prev => ({ ...prev, service: matchedService.id }));
                    }
                    scrollToSection('appointment');
                  }}
                  className={`w-full py-4 font-label-md text-label-md uppercase tracking-widest transition-all font-semibold ${
                    idx === 1 ? 'bg-brand-gold text-white hover:bg-brand-gold/90' : 'border border-brand-gold/30 hover:bg-brand-gold hover:text-white'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Form Booking Section */}
      <section className="py-section-gap bg-surface-container-high/30" id="appointment">
        <div className="px-6 md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-stretch">
            <div className="flex flex-col justify-center space-y-8">
              <h2 className="font-headline-lg text-headline-lg leading-tight font-bold">Begin Your Path to Absolute Clarity</h2>
              <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
                Schedule a premium consultation with our senior associates to discuss your financial roadmap.
              </p>
              <div className="pt-8 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 flex items-center justify-center border border-brand-gold/20 bg-white">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">Direct Office Lines</p>
                    <p className="font-headline-sm text-[20px] font-bold text-on-surface">
                      +91 7000826981, 9826333180
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 flex items-center justify-center border border-brand-gold/20 bg-white">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">Email Inquiry</p>
                    <p className="font-headline-sm text-[20px] font-bold text-on-surface">vivekjhabak@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Card */}
            <div className="bg-white p-10 md:p-12 border border-outline-variant/30 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>
              
              <h3 className="font-headline-sm text-[22px] font-bold mb-8 uppercase tracking-wide">Request a Consultation</h3>

              {apptSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-5 mb-8 border-l-4 border-emerald-500 font-body-md text-sm">
                  {apptSuccess}
                </div>
              )}

              {apptError && (
                <div className="bg-rose-50 text-rose-800 p-5 mb-8 border-l-4 border-rose-500 font-body-md text-sm">
                  {apptError}
                </div>
              )}

              <form onSubmit={handleApptSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your name" 
                      value={appointmentForm.name}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com" 
                      value={appointmentForm.email}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ten digit mobile" 
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Service Required</label>
                    <select 
                      value={appointmentForm.service}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, service: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Preferred Date</label>
                    <input 
                      type="date" 
                      required
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Time Slot</label>
                    <select 
                      value={appointmentForm.timeSlot}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                    >
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Consultation Notes (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Briefly describe your taxation or business case" 
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={apptSubmitting}
                  className="w-full bg-brand-gold text-white py-5 font-label-md text-label-md uppercase tracking-[0.2em] hover:shadow-2xl transition-all mt-4 font-bold flex justify-center items-center gap-2"
                >
                  {apptSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Slot...
                    </>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-section-gap px-6 md:px-margin-desktop max-w-container-max mx-auto text-center">
        <span className="material-symbols-outlined text-[64px] mb-12 opacity-30">format_quote</span>
        <div className="max-w-3xl mx-auto space-y-12">
          <p className="font-headline-md text-2xl md:text-headline-md italic leading-relaxed text-on-surface">
            "The level of strategic clarity provided by Vivek Jhabak &amp; Associates has been instrumental in our company's expansion. Their meticulous approach to taxation is truly world-class."
          </p>
          <div className="space-y-1">
            <p className="font-label-md text-label-md uppercase tracking-widest text-brand-gold font-bold">Ramesh Agrawal</p>
            <p className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">CEO, Agrawal Logistics</p>
          </div>
        </div>
      </section>

      {/* Careers Section (Dynamic Open Vacancies) */}
      <section className="py-section-gap bg-surface-container-low" id="careers">
        <div className="px-6 md:px-margin-desktop max-w-container-max mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg font-bold">Build Your Career</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Join a team of elite professionals. We provide a rigorous, hands-on learning environment for article trainees and qualified accountants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-gutter">
            {vacancies.length > 0 ? (
              vacancies.map((job) => (
                <div key={job.id} className="bg-white p-8 border border-outline-variant/30 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline-sm text-xl font-bold">{job.title}</h3>
                      <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {job.type}
                      </span>
                    </div>
                    <p className="font-label-sm text-xs text-on-surface-variant uppercase font-semibold">
                      Department: {job.department} | Location: {job.location}
                    </p>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                      {job.description}
                    </p>
                    <div className="space-y-2 pt-4">
                      <p className="font-label-sm text-xs font-bold uppercase tracking-wider">Requirements:</p>
                      <ul className="space-y-1 text-xs text-on-surface-variant">
                        {job.requirements.map((req, rIdx) => (
                          <li key={rIdx} className="flex gap-2">
                            <span className="text-brand-gold">•</span> {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white py-3 px-6 text-xs font-bold uppercase tracking-wider font-semibold self-start transition-all"
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white border border-dashed border-outline-variant/50">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">work_off</span>
                <p className="font-body-md text-on-surface-variant">No current open vacancies. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Google Maps Embed & Contact Details */}
      <section className="pb-section-gap px-6 md:px-margin-desktop max-w-container-max mx-auto pt-10" id="contact">
        <div className="border border-outline-variant/30 grid lg:grid-cols-3 overflow-hidden">
          
          {/* Real Google Maps Embed */}
          <div className="lg:col-span-2 bg-surface-container min-h-[400px] h-full relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14919.12458428807!2d81.9056073!3d20.9622999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2f3fcd4a61abcb%3A0x6b1cfb2195f68b3f!2sNawapara%20Rajim!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '400px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Vivek Jhabak & Associates Office Location"
            ></iframe>
          </div>

          {/* Contact Details & Inquiry Form */}
          <div className="p-10 md:p-12 bg-white space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">HQ Address</h4>
                <p className="font-body-md text-sm leading-relaxed text-on-surface font-semibold">
                  196, Ward No. 3, Station Road,<br/>
                  Nawapara, Rajim,<br/>
                  Chhattisgarh - 493881
                </p>
              </div>
              <div>
                <h4 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Firm Details</h4>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Firm Name: <strong className="text-on-surface">Vivek Jhabak & Associates</strong><br/>
                  Experience: <strong className="text-on-surface">20+ Years Legacy</strong>
                </p>
              </div>
              <div>
                <h4 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Operating Hours</h4>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Mon - Sat: 10:00 AM - 07:00 PM<br/>
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-6">
              <h4 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Send a Message</h4>
              
              {contactSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-3 mb-4 text-xs font-body-md">
                  {contactSuccess}
                </div>
              )}

              {contactError && (
                <div className="bg-rose-50 text-rose-800 p-3 mb-4 text-xs font-body-md">
                  {contactError}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input 
                  type="text" 
                  required
                  placeholder="Your Name" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-xs focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                />
                <input 
                  type="email" 
                  required
                  placeholder="Your Email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-xs focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                />
                <input 
                  type="text" 
                  required
                  placeholder="Message or Subject" 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-xs focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
                />
                <button 
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full bg-on-surface text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-brand-gold transition-all"
                >
                  {contactSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 px-6 md:px-margin-desktop py-12 flex flex-col md:flex-row justify-between items-start gap-gutter max-w-container-max mx-auto">
        <div className="space-y-4">
          <div className="font-headline-sm text-headline-sm text-primary font-bold">Vivek Jhabak &amp; Associates</div>
          <p className="max-w-xs font-body-md text-sm text-on-surface-variant">
            Chartered Accountants providing strategic excellence and financial integrity since two decades.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-gutter md:gap-20">
          <div className="space-y-4">
            <h5 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold">Links</h5>
            <ul className="space-y-2 font-label-md text-sm text-on-surface-variant">
              <li><button onClick={() => scrollToSection('about')} className="hover:text-secondary transition-colors">About</button></li>
              <li><button onClick={() => scrollToSection('services')} className="hover:text-secondary transition-colors">Services</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-secondary transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold">Public API</h5>
            <ul className="space-y-2 font-label-md text-sm text-on-surface-variant">
              <li><Link to="/login" className="hover:text-secondary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="w-full mt-12 pt-6 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-xs text-on-surface-variant">
            © 2026 Vivek Jhabak &amp; Associates. All rights reserved.
          </p>
          <div className="flex gap-8 font-label-sm text-xs text-on-surface-variant">
            <span>Nawapara, Rajim, Chhattisgarh</span>
          </div>
        </div>
      </footer>

      {/* Floating Elements */}
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/917000826981" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        title="Chat on WhatsApp"
      >
        <svg 
          className="w-8 h-8 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.993L2 22l5.233-1.371a9.92 9.92 0 0 0 4.775 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.92 9.92 0 0 0 12.012 2zm5.794 14.153c-.319.897-1.558 1.661-2.148 1.761-.59.1-1.332.185-3.904-.875-3.29-1.356-5.412-4.704-5.576-4.922-.164-.219-1.312-1.745-1.312-3.33 0-1.584.827-2.361 1.122-2.68.295-.319.64-.399.853-.399.213 0 .426.002.61.01.192.008.45-.074.705.539.262.63.896 2.18.974 2.34.078.16.13.345.024.558-.105.213-.158.345-.313.52-.154.177-.323.395-.46.528-.153.15-.314.313-.136.619.177.306.788 1.3 1.688 2.1.164.146.438.332.748.435.31.104.534.086.732-.143.197-.229.852-.992.973-1.332.122-.34.244-.282.41-.22.167.061 1.054.498 1.238.59.183.091.305.137.35.213.046.076.046.442-.137 1.339z" />
        </svg>
      </a>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-50 bg-brand-gold text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-gold/90 hover:scale-105 transition-all"
            title="Back to Top"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_upward</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Careers / Job Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full border-t-4 border-brand-gold p-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => {
                  setSelectedJob(null);
                  setCareerError('');
                  setCareerSuccess('');
                }}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-brand-gold"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>

              <div className="space-y-4 mb-6">
                <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Job Application
                </span>
                <h3 className="font-headline-sm text-xl font-bold">Apply for: {selectedJob.title}</h3>
                <p className="text-xs text-on-surface-variant">
                  Department: {selectedJob.department} | Type: {selectedJob.type}
                </p>
              </div>

              {careerSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-4 mb-6 text-sm">
                  {careerSuccess}
                </div>
              )}

              {careerError && (
                <div className="bg-rose-50 text-rose-800 p-4 mb-6 text-sm border-l-4 border-rose-500">
                  {careerError}
                </div>
              )}

              <form onSubmit={handleCareerSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name" 
                    value={careerForm.name}
                    onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 focus:ring-0 focus:border-brand-gold transition-colors text-sm font-body-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com" 
                      value={careerForm.email}
                      onChange={(e) => setCareerForm({ ...careerForm, email: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent py-2 focus:ring-0 focus:border-brand-gold transition-colors text-sm font-body-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Phone</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="10-digit mobile" 
                      value={careerForm.phone}
                      onChange={(e) => setCareerForm({ ...careerForm, phone: e.target.value })}
                      className="w-full border-0 border-b border-outline-variant bg-transparent py-2 focus:ring-0 focus:border-brand-gold transition-colors text-sm font-body-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Notes / Cover Letter</label>
                  <textarea 
                    rows="2"
                    placeholder="Tell us about your educational background or intermediate attempt status" 
                    value={careerForm.notes}
                    onChange={(e) => setCareerForm({ ...careerForm, notes: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 focus:ring-0 focus:border-brand-gold transition-colors text-sm font-body-md resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-xs font-bold uppercase tracking-wider block">Upload Resume (PDF Only, Max 5MB)</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    required
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={careerSubmitting}
                  className="w-full bg-brand-gold text-white py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:shadow-xl transition-all font-bold flex justify-center items-center gap-2"
                >
                  {careerSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading PDF...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
