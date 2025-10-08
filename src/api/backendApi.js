// src/api/backendApi.js
// API client per connectar amb el backend

import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Obtenir configuració d'equips
export const getTeamsConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/config`);
    return response.data;
  } catch (error) {
    console.error('Error al obtenir configuració del backend:', error);
    throw error;
  }
};

// Obtenir metadata
export const getMetadata = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/metadata`);
    return response.data;
  } catch (error) {
    console.error('Error al obtenir metadata:', error);
    throw error;
  }
};

// Forçar actualització manual
export const forceUpdate = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/update`);
    return response.data;
  } catch (error) {
    console.error('Error al forçar actualització:', error);
    throw error;
  }
};

// Obtenir estat del sistema
export const getSystemStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/status`);
    return response.data;
  } catch (error) {
    console.error('Error al obtenir estat del sistema:', error);
    throw error;
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error en health check:', error);
    return { status: 'error', message: 'Backend no disponible' };
  }
};