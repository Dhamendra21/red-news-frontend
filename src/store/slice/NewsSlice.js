import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from "@/services/api";

export const fetchNews = createAsyncThunk('news/fetchNews', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/news', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchTrending = createAsyncThunk('news/fetchTrending', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/news/trending', { params: { limit: 10, ...params } });
    return data; // Changed from data.data to data to get pagination details
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBreaking = createAsyncThunk('news/fetchBreaking', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/news/breaking');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchNewsBySlug = createAsyncThunk('news/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/news/${slug}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    list: [],
    trending: [],
    breaking: [],
    currentNews: null,
    total: 0,
    pages: 1,
    currentPage: 1,
    trendingTotal: 0,
    trendingPages: 1,
    trendingCurrentPage: 1,
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentNews: (state) => { state.currentNews = null; },
    clearNewsList: (state) => {
      state.list = [];
      state.currentPage = 1;
      state.pages = 1;
    },
    clearTrendingList: (state) => {
      state.trending = [];
      state.trendingCurrentPage = 1;
      state.trendingPages = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg?.page > 1) {
          state.list = [...state.list, ...action.payload.data];
        } else {
          state.list = action.payload.data;
        }
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrending.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTrending.fulfilled, (state, action) => { 
        state.isLoading = false;
        if (action.meta.arg?.page > 1) {
          state.trending = [...state.trending, ...action.payload.data];
        } else {
          state.trending = action.payload.data;
        }
        state.trendingTotal = action.payload.total;
        state.trendingPages = action.payload.pages;
        state.trendingCurrentPage = action.payload.currentPage;
      })
      .addCase(fetchNewsBySlug.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentNews, clearNewsList, clearTrendingList } = newsSlice.actions;
export default newsSlice.reducer;
