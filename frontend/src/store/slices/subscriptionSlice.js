import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionService from '../../services/subscriptionService';

// Async thunks
export const fetchMySubscription = createAsyncThunk(
  'subscription/fetchMySubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getMySubscription();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const fetchSubscriptionUsage = createAsyncThunk(
  'subscription/fetchSubscriptionUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getSubscriptionUsage();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch usage');
    }
  }
);

export const createStripeCustomer = createAsyncThunk(
  'subscription/createStripeCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.createStripeCustomer(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.createSubscription(subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.cancelSubscription();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const reactivateSubscription = createAsyncThunk(
  'subscription/reactivateSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.reactivateSubscription();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reactivate subscription');
    }
  }
);

const initialState = {
  subscription: null,
  usage: null,
  isLoading: false,
  isCreating: false,
  error: null,
  upgradeSuggestions: []
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpgradeSuggestions: (state) => {
      state.upgradeSuggestions = [];
    },
    updateUsage: (state, action) => {
      if (state.usage) {
        state.usage = { ...state.usage, ...action.payload };
      }
    },
    generateUpgradeSuggestions: (state) => {
      if (state.subscription && state.usage) {
        state.upgradeSuggestions = subscriptionService.getUpgradeSuggestions(
          state.subscription,
          state.usage
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription
      .addCase(fetchMySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch usage
      .addCase(fetchSubscriptionUsage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usage = action.payload;
      })
      .addCase(fetchSubscriptionUsage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create customer
      .addCase(createStripeCustomer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createStripeCustomer.fulfilled, (state, action) => {
        state.isCreating = false;
      })
      .addCase(createStripeCustomer.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isCreating = false;
        state.subscription = action.payload.subscription;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.subscription) {
          state.subscription.cancelAtPeriodEnd = true;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reactivate subscription
      .addCase(reactivateSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reactivateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.subscription) {
          state.subscription.cancelAtPeriodEnd = false;
        }
      })
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearUpgradeSuggestions, 
  updateUsage, 
  generateUpgradeSuggestions 
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;


