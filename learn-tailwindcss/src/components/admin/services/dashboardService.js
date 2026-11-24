import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Indicadores generales
export const getDashboardSummary = async () => {
  const response = await axios.get(`${API_URL}/dashboard/summary`);

  return response.data;
};

// Resumen de la jornada comercial
export const getBusinessDaySummary = async (referenceDate = null) => {
  const response = await axios.get(`${API_URL}/dashboard/business-day`, {
    params: referenceDate ? { reference_date: referenceDate } : {},
  });

  return response.data;
};

// Resumen semanal
export const getBusinessWeekSummary = async (referenceDate = null) => {
  const response = await axios.get(`${API_URL}/dashboard/business-week`, {
    params: referenceDate ? { reference_date: referenceDate } : {},
  });

  return response.data;
};

// Estadísticas de pedidos
export const getDashboardOrders = async (period = 'day', referenceDate = null) => {
  const response = await axios.get(`${API_URL}/dashboard/orders`, {
    params: {
      period,
      ...(referenceDate && { reference_date: referenceDate }),
    },
  });

  return response.data;
};

// Estadísticas de usuarios
export const getDashboardUsers = async (period = 'day', referenceDate = null) => {
  const response = await axios.get(`${API_URL}/dashboard/users`, {
    params: {
      period,
      ...(referenceDate && { reference_date: referenceDate }),
    },
  });

  return response.data;
};

// Estadísticas de productos
export const getDashboardProducts = async (period = 'day', referenceDate = null) => {
  const response = await axios.get(`${API_URL}/dashboard/products`, {
    params: {
      period,
      ...(referenceDate && { reference_date: referenceDate }),
    },
  });

  return response.data;
};

// Exportar Dashboard a Excel
export const downloadDashboardExcel = async (period = 'day') => {
  const response = await axios.get(`${API_URL}/dashboard/export`, {
    params: { period },
    responseType: 'blob',
  });

  // Crear una URL temporal para el archivo
  const url = window.URL.createObjectURL(new Blob([response.data]));

  // Crear un enlace temporal para iniciar la descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dashboard_${period}.xlsx`);

  document.body.appendChild(link);
  link.click();

  // Limpiar los elementos temporales
  link.remove();
  window.URL.revokeObjectURL(url);
};
