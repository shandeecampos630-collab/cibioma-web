import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
    // Obtener todas las especies (con filtro opcional por categoría)
    getEspecies: async (categoria = null) => {
        const url = categoria ? `${API_URL}/especies?categoria=${categoria}` : `${API_URL}/especies`;
        const response = await axios.get(url);
        return response.data;
    },
    
    // Obtener una especie por ID
    getEspecie: async (id) => {
        const response = await axios.get(`${API_URL}/especies/${id}`);
        return response.data;
    },
    
    // Buscar especies por nombre
    buscar: async (termino) => {
        const response = await axios.get(`${API_URL}/buscar?q=${termino}`);
        return response.data;
    },
    
    // Obtener todas las categorías
    getCategorias: async () => {
        const response = await axios.get(`${API_URL}/categorias`);
        return response.data;
    }
};