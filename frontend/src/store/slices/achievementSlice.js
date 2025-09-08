import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import achievementService from '../../services/achievementService';

// Async thunks
export const fetchAchievements = createAsyncThunk(
  'achievements/fetchAchievements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAchievements(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchMyAchievements = createAsyncThunk(
  'achievements/fetchMyAchievements',
  async (unlocked, { rejectWithValue }) => {
    try {
      const response = await achievementService.getMyAchievements(unlocked);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user achievements');
    }
  }
);

export const fetchAchievementProgress = createAsyncThunk(
  'achievements/fetchAchievementProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAchievementProgress();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievement progress');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'achievements/fetchLeaderboard',
  async ({ type = 'totalPoints', limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await achievementService.getLeaderboard(type, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchUserRank = createAsyncThunk(
  'achievements/fetchUserRank',
  async (type = 'totalPoints', { rejectWithValue }) => {
    try {
      const response = await achievementService.getUserRank(type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user rank');
    }
  }
);

export const checkAchievements = createAsyncThunk(
  'achievements/checkAchievements',
  async ({ action, data }, { rejectWithValue }) => {
    try {
      const response = await achievementService.checkAchievements(action, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check achievements');
    }
  }
);

const initialState = {
  achievements: [],
  myAchievements: [],
  progress: [],
  leaderboard: [],
  userRank: null,
  unlockedAchievements: [],
  isLoading: false,
  isChecking: false,
  error: null,
  lastChecked: null
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUnlockedAchievements: (state) => {
      state.unlockedAchievements = [];
    },
    addUnlockedAchievement: (state, action) => {
      state.unlockedAchievements.push(action.payload);
    },
    updateUserStats: (state, action) => {
      // This will be handled by the user stats slice
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch my achievements
      .addCase(fetchMyAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAchievements = action.payload;
      })
      .addCase(fetchMyAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch achievement progress
      .addCase(fetchAchievementProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAchievementProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress = action.payload;
      })
      .addCase(fetchAchievementProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user rank
      .addCase(fetchUserRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRank = action.payload;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Check achievements
      .addCase(checkAchievements.pending, (state) => {
        state.isChecking = true;
        state.error = null;
      })
      .addCase(checkAchievements.fulfilled, (state, action) => {
        state.isChecking = false;
        state.unlockedAchievements = action.payload.unlockedAchievements || [];
        state.lastChecked = new Date().toISOString();
      })
      .addCase(checkAchievements.rejected, (state, action) => {
        state.isChecking = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearUnlockedAchievements, 
  addUnlockedAchievement,
  updateUserStats 
} = achievementSlice.actions;

export default achievementSlice.reducer;


