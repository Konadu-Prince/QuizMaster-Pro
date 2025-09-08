import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '../../services/quizService';
import quizAttemptService from '../../services/quizAttemptService';

// Async thunks for quizzes
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await quizService.getQuizzes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quizService.getQuizById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await quizService.createQuiz(quizData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ id, quizData }, { rejectWithValue }) => {
    try {
      const response = await quizService.updateQuiz(id, quizData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      await quizService.deleteQuiz(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

export const fetchUserQuizzes = createAsyncThunk(
  'quiz/fetchUserQuizzes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await quizService.getUserQuizzes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user quizzes');
    }
  }
);

export const togglePublishQuiz = createAsyncThunk(
  'quiz/togglePublishQuiz',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quizService.togglePublishQuiz(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle quiz publish status');
    }
  }
);

// Async thunks for quiz attempts
export const startQuizAttempt = createAsyncThunk(
  'quiz/startQuizAttempt',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizAttemptService.startQuizAttempt(quizId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start quiz attempt');
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'quiz/submitAnswer',
  async ({ attemptId, questionId, selectedAnswer, timeSpent }, { rejectWithValue }) => {
    try {
      const response = await quizAttemptService.submitAnswer(attemptId, questionId, selectedAnswer, timeSpent);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const completeQuizAttempt = createAsyncThunk(
  'quiz/completeQuizAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await quizAttemptService.completeQuizAttempt(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete quiz attempt');
    }
  }
);

export const fetchQuizAttempt = createAsyncThunk(
  'quiz/fetchQuizAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await quizAttemptService.getQuizAttempt(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz attempt');
    }
  }
);

const initialState = {
  // Quiz state
  quizzes: [],
  currentQuiz: null,
  userQuizzes: [],
  quizPagination: {
    currentPage: 1,
    totalPages: 0,
    totalQuizzes: 0,
    hasNext: false,
    hasPrev: false,
  },
  
  // Quiz attempt state
  currentAttempt: null,
  attemptResults: null,
  userAttempts: [],
  
  // UI state
  isLoading: false,
  isAttemptLoading: false,
  error: null,
  attemptError: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.attemptError = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
      state.attemptResults = null;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    updateQuizInList: (state, action) => {
      const updatedQuiz = action.payload;
      const index = state.quizzes.findIndex(quiz => quiz._id === updatedQuiz._id);
      if (index !== -1) {
        state.quizzes[index] = updatedQuiz;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = action.payload.quizzes || [];
        state.quizPagination = action.payload.pagination || state.quizPagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload.quiz || action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userQuizzes.unshift(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedQuiz = action.payload;
        const index = state.userQuizzes.findIndex(quiz => quiz._id === updatedQuiz._id);
        if (index !== -1) {
          state.userQuizzes[index] = updatedQuiz;
        }
        if (state.currentQuiz && state.currentQuiz._id === updatedQuiz._id) {
          state.currentQuiz = updatedQuiz;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userQuizzes = state.userQuizzes.filter(quiz => quiz._id !== action.payload);
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user quizzes
      .addCase(fetchUserQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userQuizzes = action.payload.quizzes || [];
        state.quizPagination = action.payload.pagination || state.quizPagination;
      })
      .addCase(fetchUserQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Toggle publish quiz
      .addCase(togglePublishQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(togglePublishQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedQuiz = action.payload;
        const index = state.userQuizzes.findIndex(quiz => quiz._id === updatedQuiz._id);
        if (index !== -1) {
          state.userQuizzes[index] = updatedQuiz;
        }
      })
      .addCase(togglePublishQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Start quiz attempt
      .addCase(startQuizAttempt.pending, (state) => {
        state.isAttemptLoading = true;
        state.attemptError = null;
      })
      .addCase(startQuizAttempt.fulfilled, (state, action) => {
        state.isAttemptLoading = false;
        state.currentAttempt = action.payload;
      })
      .addCase(startQuizAttempt.rejected, (state, action) => {
        state.isAttemptLoading = false;
        state.attemptError = action.payload;
      })
      
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.isAttemptLoading = true;
        state.attemptError = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.isAttemptLoading = false;
        if (state.currentAttempt) {
          state.currentAttempt.answers.push(action.payload.answer);
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.isAttemptLoading = false;
        state.attemptError = action.payload;
      })
      
      // Complete quiz attempt
      .addCase(completeQuizAttempt.pending, (state) => {
        state.isAttemptLoading = true;
        state.attemptError = null;
      })
      .addCase(completeQuizAttempt.fulfilled, (state, action) => {
        state.isAttemptLoading = false;
        state.attemptResults = action.payload.results;
        if (state.currentAttempt) {
          state.currentAttempt = action.payload.attempt;
        }
      })
      .addCase(completeQuizAttempt.rejected, (state, action) => {
        state.isAttemptLoading = false;
        state.attemptError = action.payload;
      })
      
      // Fetch quiz attempt
      .addCase(fetchQuizAttempt.pending, (state) => {
        state.isAttemptLoading = true;
        state.attemptError = null;
      })
      .addCase(fetchQuizAttempt.fulfilled, (state, action) => {
        state.isAttemptLoading = false;
        state.currentAttempt = action.payload;
      })
      .addCase(fetchQuizAttempt.rejected, (state, action) => {
        state.isAttemptLoading = false;
        state.attemptError = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentQuiz,
  clearCurrentAttempt,
  setCurrentQuiz,
  updateQuizInList,
} = quizSlice.actions;

export default quizSlice.reducer;