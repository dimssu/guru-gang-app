import axios from './axios';

// Mark a slide as viewed
export const markSlideViewed = async (courseId, slideId, token) => {
  try {
    const response = await axios.post('/api/progress/view-slide', 
      { courseId, slideId }, 
      { headers: { 'x-auth-token': token } }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking slide as viewed:', error);
    throw error;
  }
};

// Get progress for a specific course
export const getCourseProgress = async (courseId, token) => {
  try {
    const response = await axios.get(`/api/progress/course/${courseId}`, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get progress for all enrolled courses
export const getAllCoursesProgress = async (token) => {
  try {
    const response = await axios.get('/api/progress/all-courses', {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all courses progress:', error);
    throw error;
  }
}; 