import { useState, useEffect } from 'react';

interface FeedbackDto {
  feedbackId: number;
  rentalId: number;
  userId: number;
  customerName: string;
  vehicleModel: string;
  rating: number;
  comment?: string;
  createdAt: string;
  staffResponse?: string;
  staffResponseAt?: string;
  staffId?: number;
  staffName?: string;
}

interface FeedbackStatsDto {
  averageRating: number;
  totalReviews: number;
  positiveReviews: number;
  ratingDistribution: Record<number, number>;
}

interface StaffResponseRequest {
  response: string;
}

interface CreateFeedbackRequest {
  rentalId: number;
  rating: number;
  comment?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useFeedbackApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getFeedbacksByStation = async (stationId: number): Promise<FeedbackDto[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/station/${stationId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedbacks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackStats = async (stationId: number): Promise<FeedbackStatsDto> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/station/${stationId}/stats`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecentFeedbacks = async (stationId: number, limit: number = 10): Promise<FeedbackDto[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/station/${stationId}/recent?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent feedbacks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStaffResponse = async (feedbackId: number, response: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: StaffResponseRequest = { response };
      
      const apiResponse = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/response`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || `HTTP error! status: ${apiResponse.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add staff response';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFeedback = async (request: CreateFeedbackRequest): Promise<FeedbackDto> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getFeedbacksByStation,
    getFeedbackStats,
    getRecentFeedbacks,
    addStaffResponse,
    createFeedback,
  };
};
