import axios from './axios';

// Get all slides for a course
export const getSlidesByCourse = async (courseId, token) => {
  try {
    const response = await axios.get(`/api/slides/course/${courseId}`, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching slides:', error);
    throw error;
  }
};

// Create a new slide
export const createSlide = async (courseId, slideData, token) => {
  try {
    const response = await axios.post(`/api/slides/course/${courseId}`, slideData, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating slide:', error);
    throw error;
  }
};

// Update a slide
export const updateSlide = async (slideId, slideData, token) => {
  try {
    const response = await axios.put(`/api/slides/${slideId}`, slideData, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating slide:', error);
    throw error;
  }
};

// Delete a slide
export const deleteSlide = async (slideId, token) => {
  try {
    const response = await axios.delete(`/api/slides/${slideId}`, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting slide:', error);
    throw error;
  }
};

// Reorder slides
export const reorderSlides = async (courseId, slideOrders, token) => {
  try {
    const response = await axios.put(`/api/slides/course/${courseId}/reorder`, 
      { slideOrders }, 
      { headers: { 'x-auth-token': token } }
    );
    return response.data;
  } catch (error) {
    console.error('Error reordering slides:', error);
    throw error;
  }
}; 