import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, initialData = null, immediate = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
  };
};

export const usePagination = (fetchFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (page = 1, newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction({
        ...params,
        ...newParams,
        page,
      });

      const responseData = response.data.data || response.data;
      
      if (page === 1) {
        setData(responseData.data || responseData);
      } else {
        setData(prev => [...prev, ...(responseData.data || responseData)]);
      }
      
      if (responseData.pagination) {
        setPagination(responseData.pagination);
      }
      
      return responseData;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, params]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      fetchData(pagination.currentPage + 1);
    }
  }, [fetchData, pagination.hasNext, pagination.currentPage, loading]);

  const refresh = useCallback((newParams = {}) => {
    setParams(prev => ({ ...prev, ...newParams }));
    setData([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    });
    return fetchData(1, newParams);
  }, [fetchData]);

  useEffect(() => {
    fetchData(1);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    setParams,
  };
};
