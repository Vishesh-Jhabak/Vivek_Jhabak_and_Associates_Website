const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api');

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('ca_admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'An error occurred';
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Services APIs
  getServices: async (all = false) => {
    const url = all ? `${API_BASE_URL}/services?all=true` : `${API_BASE_URL}/services`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  createService: async (serviceData) => {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  updateService: async (id, serviceData) => {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  deleteService: async (id) => {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Pricing APIs
  getPricing: async (all = false) => {
    const url = all ? `${API_BASE_URL}/pricing?all=true` : `${API_BASE_URL}/pricing`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  createPricing: async (pricingData) => {
    const res = await fetch(`${API_BASE_URL}/pricing`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pricingData),
    });
    return handleResponse(res);
  },

  updatePricing: async (id, pricingData) => {
    const res = await fetch(`${API_BASE_URL}/pricing/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(pricingData),
    });
    return handleResponse(res);
  },

  deletePricing: async (id) => {
    const res = await fetch(`${API_BASE_URL}/pricing/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Appointment APIs
  bookAppointment: async (appointmentData) => {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(res);
  },

  getAppointments: async () => {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateAppointmentStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  deleteAppointment: async (id) => {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Contact APIs
  submitContactForm: async (contactData) => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contactData),
    });
    return handleResponse(res);
  },

  getMessages: async () => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateMessageStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  deleteMessage: async (id) => {
    const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Vacancy & Careers APIs
  getJobs: async (all = false) => {
    const url = all ? `${API_BASE_URL}/jobs?all=true` : `${API_BASE_URL}/jobs`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  createJob: async (jobData) => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(res);
  },

  updateJob: async (id, jobData) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(res);
  },

  deleteJob: async (id) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  applyForJob: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/careers`, {
      method: 'POST',
      headers: getHeaders(true), // Multipart headers
      body: formData,
    });
    return handleResponse(res);
  },

  getApplicants: async () => {
    const res = await fetch(`${API_BASE_URL}/applicants`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getResumeDownloadUrl: (filename) => {
    return `${API_BASE_URL}/resumes/${filename}`;
  },
  
  getResumeFile: async (filename) => {
    const token = localStorage.getItem('ca_admin_token');
    const res = await fetch(`${API_BASE_URL}/resumes/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to load file');
    return res.blob();
  }
};
