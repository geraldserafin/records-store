import { api } from "../../lib/api";

export const fetchProducts = async (page = 1, limit = 10, options = {}) => {
  const searchParams = new URLSearchParams();
  searchParams.set('page', page);
  searchParams.set('limit', limit);

  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Format for NestJS class-transformer: filter[name]=value
        searchParams.set(`filter[${key}]`, value);
      }
    });
  }
  
  return await api.get('products', { searchParams }).json();
};

export const fetchProductById = async (id) => {
  return await api.get(`products/${id}`).json();
};

export const fetchArtists = async () => {
  return await api.get('artists').json();
};

export const fetchGenres = async () => {
  return await api.get('genres').json();
};
