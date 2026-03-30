import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const contactAPI = {
  submit: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/contact`, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Errore durante l\'invio della richiesta');
      } else if (error.request) {
        throw new Error('Impossibile contattare il server. Riprova più tardi.');
      } else {
        throw new Error('Errore durante l\'invio della richiesta');
      }
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/api/contact`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Errore durante il recupero dei dati');
    }
  }
};
