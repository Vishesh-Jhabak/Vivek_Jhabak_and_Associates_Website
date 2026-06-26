import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Active Panel State
  const [activeTab, setActiveTab] = useState('analytics');

  // DB States
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // CRUD Modal States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', price: 0, category: 'Taxation', icon: 'percent', status: 'active'
  });

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    name: '', description: '', price: '', features: '', category: 'Individual', status: 'active'
  });

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', department: 'Taxation & Auditing', description: '', requirements: '', type: 'Full-time', location: 'Nawapara, Rajim', status: 'open'
  });

  // Fetch admin dashboard data on mount
  const refreshData = async () => {
    setLoading(true);
    try {
      const [apptRes, svcRes, prcRes, vacRes, appRes, msgRes] = await Promise.all([
        api.getAppointments(),
        api.getServices(true),
        api.getPricing(true),
        api.getJobs(true),
        api.getApplicants(),
        api.getMessages()
      ]);

      if (apptRes.success) setAppointments(apptRes.data);
      if (svcRes.success) setServices(svcRes.data);
      if (prcRes.success) setPricing(prcRes.data);
      if (vacRes.success) setVacancies(vacRes.data);
      if (appRes.success) setApplicants(appRes.data);
      if (msgRes.success) setMessages(msgRes.data);
    } catch (err) {
      showFeedback(err.message || 'Error fetching administration records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // --- CRUD Functions: Appointments ---
  const handleUpdateAppt = async (id, status) => {
    try {
      const res = await api.updateAppointmentStatus(id, status);
      if (res.success) {
        showFeedback(`Appointment marked as ${status}`);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteAppt = async (id) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      const res = await api.deleteAppointment(id);
      if (res.success) {
        showFeedback('Appointment removed from records');
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // --- CRUD Functions: Messages (Inquiries) ---
  const handleUpdateMsg = async (id, status) => {
    try {
      const res = await api.updateMessageStatus(id, status);
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteMsg = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      const res = await api.deleteMessage(id);
      if (res.success) {
        showFeedback('Message removed');
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // --- CRUD Functions: Services ---
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const res = await api.updateService(editingService.id, serviceForm);
        if (res.success) {
          showFeedback('Service updated successfully');
          setServices(prev => prev.map(s => s.id === editingService.id ? res.data : s));
        }
      } else {
        const res = await api.createService(serviceForm);
        if (res.success) {
          showFeedback('Service created successfully');
          setServices(prev => [...prev, res.data]);
        }
      }
      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ name: '', description: '', price: 0, category: 'Taxation', icon: 'percent', status: 'active' });
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service? This may affect booking records.')) return;
    try {
      const res = await api.deleteService(id);
      if (res.success) {
        showFeedback('Service deleted');
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // --- CRUD Functions: Pricing Tiers ---
  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...pricingForm,
      features: pricingForm.features.split('\n').filter(f => f.trim() !== '')
    };

    try {
      if (editingPricing) {
        const res = await api.updatePricing(editingPricing.id, payload);
        if (res.success) {
          showFeedback('Pricing package updated');
          setPricing(prev => prev.map(p => p.id === editingPricing.id ? res.data : p));
        }
      } else {
        const res = await api.createPricing(payload);
        if (res.success) {
          showFeedback('Pricing package created');
          setPricing(prev => [...prev, res.data]);
        }
      }
      setShowPricingModal(false);
      setEditingPricing(null);
      setPricingForm({ name: '', description: '', price: '', features: '', category: 'Individual', status: 'active' });
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeletePricing = async (id) => {
    if (!window.confirm('Delete this pricing plan?')) return;
    try {
      const res = await api.deletePricing(id);
      if (res.success) {
        showFeedback('Pricing plan deleted');
        setPricing(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // --- CRUD Functions: Vacancies (Jobs) ---
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...jobForm,
      requirements: jobForm.requirements.split('\n').filter(r => r.trim() !== '')
    };

    try {
      if (editingJob) {
        const res = await api.updateJob(editingJob.id, payload);
        if (res.success) {
          showFeedback('Vacancy updated successfully');
          setVacancies(prev => prev.map(j => j.id === editingJob.id ? res.data : j));
        }
      } else {
        const res = await api.createJob(payload);
        if (res.success) {
          showFeedback('Vacancy published successfully');
          setVacancies(prev => [...prev, res.data]);
        }
      }
      setShowJobModal(false);
      setEditingJob(null);
      setJobForm({ title: '', department: 'Taxation & Auditing', description: '', requirements: '', type: 'Full-time', location: 'Nawapara, Rajim', status: 'open' });
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this vacancy posting?')) return;
    try {
      const res = await api.deleteJob(id);
      if (res.success) {
        showFeedback('Vacancy post removed');
        setVacancies(prev => prev.filter(j => j.id !== id));
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // --- Secure Resume File Fetching ---
  const handleDownloadResume = async (resumePath, applicantName) => {
    try {
      const filename = resumePath.split('/').pop();
      const blob = await api.getResumeFile(filename);
      
      // Create local URL link to download blob file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Resume_${applicantName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showFeedback('Could not fetch candidate resume file: ' + err.message, 'error');
    }
  };

  // Render Tabs List Helper
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar_month' },
    { id: 'services', label: 'Services', icon: 'percent' },
    { id: 'pricing', label: 'Pricing plans', icon: 'payments' },
    { id: 'vacancies', label: 'Vacancies', icon: 'work' },
    { id: 'applicants', label: 'Applicants', icon: 'person_search' },
    { id: 'messages', label: 'Messages', icon: 'mail' },
  ];

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-on-primary-fixed text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-outline-variant/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
            <div>
              <h2 className="font-headline-sm text-sm font-bold tracking-wider">VJA Dashboard</h2>
              <p className="text-[10px] text-brand-gold font-semibold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          
          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage({ text: '', type: '' });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all rounded-none ${
                  activeTab === tab.id
                    ? 'bg-brand-gold text-white font-bold'
                    : 'text-on-primary-fixed-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/10">
          <div className="mb-4 px-4 text-xs text-on-primary-fixed-variant">
            Logged in: <strong className="text-white block truncate">{user?.name}</strong>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-brand-gold/25 hover:bg-brand-gold text-white font-semibold py-3 text-xs uppercase tracking-widest transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-white">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-grow p-6 md:p-10 max-h-screen overflow-y-auto w-full custom-scrollbar">
        {/* Feedback Alert banners */}
        {message.text && (
          <div className={`p-4 mb-6 border-l-4 font-body-md text-sm flex items-center gap-2 ${
            message.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {message.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p>{message.text}</p>
          </div>
        )}

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant">Syncing records...</p>
          </div>
        ) : (
          <>
            {/* 1. TAB: ANALYTICS PANEL */}
            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Analytics Overview</h1>
                  <button onClick={refreshData} className="border border-brand-gold text-brand-gold px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-all">
                    Refresh Stats
                  </button>
                </div>
                
                {/* Stats cards list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 border border-outline-variant/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px] text-brand-gold">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant uppercase">Total Bookings</p>
                      <h3 className="text-2xl font-bold">{appointments.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px] text-amber-600">pending</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant uppercase">Pending Actions</p>
                      <h3 className="text-2xl font-bold text-amber-600">
                        {appointments.filter(a => a.status === 'pending').length}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px] text-emerald-600">person_search</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant uppercase">Job Applicants</p>
                      <h3 className="text-2xl font-bold">{applicants.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px] text-blue-600">mail</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant uppercase">Unread Messages</p>
                      <h3 className="text-2xl font-bold text-blue-600">
                        {messages.filter(m => m.status === 'unread').length}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="grid md:grid-cols-2 gap-8 pt-6">
                  <div className="bg-white p-6 border border-outline-variant/20">
                    <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">
                      Client Inquiries Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Total Messages Received</span>
                        <span className="font-bold">{messages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Active Job Vacancies Posted</span>
                        <span className="font-bold">{vacancies.filter(v => v.status === 'open').length}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Dynamic Pricing Tiers Active</span>
                        <span className="font-bold">{pricing.filter(p => p.status === 'active').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-outline-variant/20">
                    <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">
                      Client Booking Success Rate
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Approved Appointments</span>
                        <span className="font-bold text-emerald-600">
                          {appointments.filter(a => a.status === 'approved').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Cancelled Appointments</span>
                        <span className="font-bold text-rose-600">
                          {appointments.filter(a => a.status === 'cancelled').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-outline-variant/10">
                        <span>Pending Review</span>
                        <span className="font-bold text-amber-500">
                          {appointments.filter(a => a.status === 'pending').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: APPOINTMENTS PANEL */}
            {activeTab === 'appointments' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Client Appointments</h1>
                </div>

                <div className="bg-white border border-outline-variant/20 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/30 border-b border-outline-variant/20">
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Client Details</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Selected Service</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Date &amp; Time Slot</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Status</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length > 0 ? (
                        appointments.map((appt) => (
                          <tr key={appt.id} className="border-b border-outline-variant/10 hover:bg-surface-bright text-sm">
                            <td className="p-4">
                              <p className="font-bold">{appt.name}</p>
                              <p className="text-xs text-on-surface-variant">{appt.email}</p>
                              <p className="text-xs text-on-surface-variant font-semibold">{appt.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold">{appt.service?.name || 'Taxation Consultancy'}</p>
                              <p className="text-xs text-brand-gold font-bold">{appt.service?.category}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold">
                                {new Date(appt.date).toLocaleDateString('en-IN', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-on-surface-variant">{appt.timeSlot}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                appt.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                appt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {appt.status !== 'approved' && (
                                <button 
                                  onClick={() => handleUpdateAppt(appt.id, 'approved')}
                                  className="text-xs text-emerald-600 hover:underline font-bold"
                                >
                                  Approve
                                </button>
                              )}
                              {appt.status !== 'cancelled' && (
                                <button 
                                  onClick={() => handleUpdateAppt(appt.id, 'cancelled')}
                                  className="text-xs text-amber-600 hover:underline font-bold"
                                >
                                  Cancel
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteAppt(appt.id)}
                                className="text-xs text-rose-600 hover:underline font-bold pl-2 border-l border-outline-variant/30"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-10 text-center text-on-surface-variant italic">
                            No appointments found in records.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. TAB: SERVICES MANAGER PANEL */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Manage CA Services</h1>
                  <button 
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({ name: '', description: '', price: 0, category: 'Taxation', icon: 'percent', status: 'active' });
                      setShowServiceModal(true);
                    }}
                    className="bg-brand-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/90 transition-all"
                  >
                    + Add New Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((svc) => (
                    <div key={svc.id} className="bg-white p-6 border border-outline-variant/30 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline-sm text-lg font-bold">{svc.name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            svc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}>
                            {svc.status}
                          </span>
                        </div>
                        <p className="font-label-sm text-xs text-brand-gold uppercase font-semibold">
                          Category: {svc.category} | Price: ₹{svc.price}
                        </p>
                        <p className="text-sm text-on-surface-variant font-body-md line-clamp-3">
                          {svc.description}
                        </p>
                      </div>
                      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-outline-variant/10">
                        <button 
                          onClick={() => {
                            setEditingService(svc);
                            setServiceForm({ ...svc });
                            setShowServiceModal(true);
                          }}
                          className="text-xs text-brand-gold hover:underline font-bold uppercase tracking-wider"
                        >
                          Edit Details
                        </button>
                        <button 
                          onClick={() => handleDeleteService(svc.id)}
                          className="text-xs text-rose-600 hover:underline font-bold uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TAB: PRICING PLANS PANEL */}
            {activeTab === 'pricing' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Manage Pricing Plans</h1>
                  <button 
                    onClick={() => {
                      setEditingPricing(null);
                      setPricingForm({ name: '', description: '', price: '', features: '', category: 'Individual', status: 'active' });
                      setShowPricingModal(true);
                    }}
                    className="bg-brand-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/90 transition-all"
                  >
                    + Add New Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pricing.map((plan) => (
                    <div key={plan.id} className="bg-white p-6 border border-outline-variant/30 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline-sm text-md font-bold">{plan.name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            plan.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-brand-gold">{plan.price}</p>
                        <p className="text-xs text-on-surface-variant font-semibold">Category: {plan.category}</p>
                        <p className="text-xs text-on-surface-variant italic">{plan.description}</p>
                        <ul className="space-y-2 text-xs text-on-surface-variant border-t border-outline-variant/10 pt-4">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex gap-2">
                              <span>•</span> {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-outline-variant/10">
                        <button 
                          onClick={() => {
                            setEditingPricing(plan);
                            setPricingForm({
                              ...plan,
                              features: plan.features.join('\n')
                            });
                            setShowPricingModal(true);
                          }}
                          className="text-xs text-brand-gold hover:underline font-bold uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePricing(plan.id)}
                          className="text-xs text-rose-600 hover:underline font-bold uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TAB: VACANCIES PANEL */}
            {activeTab === 'vacancies' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Publish Careers Vacancies</h1>
                  <button 
                    onClick={() => {
                      setEditingJob(null);
                      setJobForm({ title: '', department: 'Taxation & Auditing', description: '', requirements: '', type: 'Full-time', location: 'Nawapara, Rajim', status: 'open' });
                      setShowJobModal(true);
                    }}
                    className="bg-brand-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/90 transition-all"
                  >
                    + Post Vacancy
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {vacancies.map((job) => (
                    <div key={job.id} className="bg-white p-6 border border-outline-variant/30 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline-sm text-lg font-bold">{job.title}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            job.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant uppercase font-semibold">
                          {job.department} | {job.type} | {job.location}
                        </p>
                        <p className="text-sm text-on-surface-variant font-body-md leading-relaxed">
                          {job.description}
                        </p>
                      </div>
                      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-outline-variant/10">
                        <button 
                          onClick={() => {
                            setEditingJob(job);
                            setJobForm({
                              ...job,
                              requirements: job.requirements.join('\n')
                            });
                            setShowJobModal(true);
                          }}
                          className="text-xs text-brand-gold hover:underline font-bold uppercase tracking-wider"
                        >
                          Edit Posting
                        </button>
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-xs text-rose-600 hover:underline font-bold uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TAB: APPLICANTS PANEL */}
            {activeTab === 'applicants' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Job Applicants</h1>
                </div>

                <div className="bg-white border border-outline-variant/20 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/30 border-b border-outline-variant/20">
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Candidate Info</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Vacancy Applied</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Applied Date</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase">Candidate Notes</th>
                        <th className="p-4 font-label-sm text-xs font-bold uppercase text-right">Resume File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.length > 0 ? (
                        applicants.map((app) => (
                          <tr key={app.id} className="border-b border-outline-variant/10 hover:bg-surface-bright text-sm">
                            <td className="p-4">
                              <p className="font-bold">{app.name}</p>
                              <p className="text-xs text-on-surface-variant">{app.email}</p>
                              <p className="text-xs text-on-surface-variant font-semibold">{app.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold">{app.job?.title || 'Article Assistant'}</p>
                              <p className="text-xs text-on-surface-variant uppercase">{app.job?.department}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-on-surface-variant">
                                {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </td>
                            <td className="p-4 max-w-xs truncate" title={app.notes}>
                              <p className="text-xs italic text-on-surface-variant">{app.notes || 'None'}</p>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDownloadResume(app.resumePath, app.name)}
                                className="bg-brand-gold/10 hover:bg-brand-gold hover:text-white border border-brand-gold text-brand-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ml-auto"
                              >
                                <span className="material-symbols-outlined text-[16px] inherit">download</span>
                                Get PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-10 text-center text-on-surface-variant italic">
                            No job applications received yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. TAB: INQUIRIES/MESSAGES PANEL */}
            {activeTab === 'messages' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                  <h1 className="font-headline-md text-headline-md font-bold">Contact inquiries</h1>
                </div>

                <div className="grid gap-6">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-6 bg-white border border-outline-variant/30 flex flex-col md:flex-row justify-between gap-4 transition-all ${
                          msg.status === 'unread' ? 'border-l-4 border-l-brand-gold shadow-md' : 'opacity-75'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-sm">{msg.name}</h3>
                            <span className="text-xs text-on-surface-variant">• {msg.email}</span>
                            {msg.phone && <span className="text-xs text-on-surface-variant">• {msg.phone}</span>}
                          </div>
                          <p className="text-xs text-brand-gold uppercase font-bold tracking-wider">Subject: {msg.subject}</p>
                          <p className="text-sm font-body-md text-on-surface-variant leading-relaxed">
                            "{msg.message}"
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Received: {new Date(msg.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="flex md:flex-col justify-end items-end gap-2 shrink-0">
                          {msg.status === 'unread' ? (
                            <button 
                              onClick={() => handleUpdateMsg(msg.id, 'read')}
                              className="text-xs text-emerald-600 hover:underline font-bold"
                            >
                              Mark as Read
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateMsg(msg.id, 'unread')}
                              className="text-xs text-amber-600 hover:underline font-bold"
                            >
                              Mark Unread
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteMsg(msg.id)}
                            className="text-xs text-rose-600 hover:underline font-bold mt-2"
                          >
                            Delete Message
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white border border-dashed border-outline-variant/50">
                      <span className="material-symbols-outlined text-[48px] text-outline mb-2">mail_outline</span>
                      <p className="font-body-md text-on-surface-variant">No client inquiries found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- CRUD MODAL: SERVICES FORM --- */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border-t-4 border-brand-gold p-8 relative">
            <button 
              onClick={() => { setShowServiceModal(false); setEditingService(null); }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-brand-gold"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-lg font-bold mb-6">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Service Name</label>
                <input 
                  type="text" 
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Description</label>
                <textarea 
                  required
                  rows="2"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value, 10) })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Category</label>
                  <select 
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  >
                    <option>Taxation</option>
                    <option>Audit & Assurance</option>
                    <option>Corporate Advisory</option>
                    <option>Financial Services</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Icon (Material Key)</label>
                  <input 
                    type="text" 
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    placeholder="percent, shield, briefcase"
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Status</label>
                  <select 
                    value={serviceForm.status}
                    onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-gold text-white py-4 text-xs font-bold uppercase tracking-widest mt-4 hover:bg-brand-gold/90 transition-all">
                {editingService ? 'Save Updates' : 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CRUD MODAL: PRICING PLANS FORM --- */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border-t-4 border-brand-gold p-8 relative">
            <button 
              onClick={() => { setShowPricingModal(false); setEditingPricing(null); }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-brand-gold"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-lg font-bold mb-6">
              {editingPricing ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
            </h3>
            <form onSubmit={handlePricingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Plan Title</label>
                <input 
                  type="text" 
                  required
                  value={pricingForm.name}
                  onChange={(e) => setPricingForm({ ...pricingForm, name: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Description</label>
                <input 
                  type="text" 
                  required
                  value={pricingForm.description}
                  onChange={(e) => setPricingForm({ ...pricingForm, description: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Price String</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. ₹1,499 / filing, ₹2,500/mo"
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Category</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Individual, Business"
                    value={pricingForm.category}
                    onChange={(e) => setPricingForm({ ...pricingForm, category: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Features list (One per line)</label>
                <textarea 
                  required
                  rows="3"
                  value={pricingForm.features}
                  onChange={(e) => setPricingForm({ ...pricingForm, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Status</label>
                <select 
                  value={pricingForm.status}
                  onChange={(e) => setPricingForm({ ...pricingForm, status: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-gold text-white py-4 text-xs font-bold uppercase tracking-widest mt-4 hover:bg-brand-gold/90 transition-all">
                {editingPricing ? 'Save Updates' : 'Publish Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CRUD MODAL: VACANCY FORM --- */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border-t-4 border-brand-gold p-8 relative">
            <button 
              onClick={() => { setShowJobModal(false); setEditingJob(null); }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-brand-gold"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-lg font-bold mb-6">
              {editingJob ? 'Edit Vacancy' : 'Post Vacancy'}
            </h3>
            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Article Assistant, Accountant"
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Department</label>
                  <input 
                    type="text" 
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Job Type</label>
                  <select 
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Description</label>
                <textarea 
                  required
                  rows="2"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider block">Requirements (One per line)</label>
                <textarea 
                  required
                  rows="3"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="Requirement 1&#10;Requirement 2"
                  className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Location</label>
                  <input 
                    type="text" 
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider block">Status</label>
                  <select 
                    value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-gold text-white py-4 text-xs font-bold uppercase tracking-widest mt-4 hover:bg-brand-gold/90 transition-all">
                {editingJob ? 'Save Vacancy Updates' : 'Publish Vacancy'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
