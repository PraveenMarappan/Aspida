export const API_BASE_URL = 'http://127.0.0.1:5000';
export const API_BASE = `${API_BASE_URL}/api`;

async function handleFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error('ASPIDA backend is not running. Please start Flask on port 5000.');
    }
    throw err;
  }
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'offline', error: 'Server returned non-200 response' };
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: 'ASPIDA backend is not running. Start Flask on port 5000.' };
  }
}

export async function predictLeafImage(formData) {
  return await handleFetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
}

export async function predictSampleImage(sampleName) {
  const formData = new FormData();
  formData.append('sampleName', sampleName);
  return await handleFetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
}

export async function getDiseases() {
  return await handleFetch(`${API_BASE}/diseases`);
}

export async function getHistory(diseaseFilter = '', search = '') {
  const params = new URLSearchParams();
  if (diseaseFilter) params.append('disease', diseaseFilter);
  if (search) params.append('search', search);

  return await handleFetch(`${API_BASE}/history?${params.toString()}`);
}

export async function getHistoryDetail(id) {
  return await handleFetch(`${API_BASE}/history/${id}`);
}

export async function getDashboardStats() {
  return await handleFetch(`${API_BASE}/dashboard`);
}

export async function getMetrics() {
  return await handleFetch(`${API_BASE}/metrics`);
}

export async function getSamples() {
  return await handleFetch(`${API_BASE}/samples`);
}

export function getReportUrl(detectionId) {
  return `${API_BASE}/report/${detectionId}`;
}

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}


