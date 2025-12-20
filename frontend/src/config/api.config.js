// Configuration API pour Intelligent Study Assistant
const API_CONFIG = {
  // URL de base du backend Flask
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Timeout par défaut (30 secondes)
  TIMEOUT: 30000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    
    // Users
    USERS: {
      BASE: '/users',
      BY_ID: (id) => `/users/${id}`,
      UPDATE: (id) => `/users/${id}`,
      DELETE: (id) => `/users/${id}`,
    },
    
    // Subjects (Matières)
    SUBJECTS: {
      BASE: '/subjects',
      BY_ID: (id) => `/subjects/${id}`,
      CREATE: '/subjects',
      UPDATE: (id) => `/subjects/${id}`,
      DELETE: (id) => `/subjects/${id}`,
      STATS: (id) => `/subjects/${id}/stats`,
    },
    
    // Tasks
    TASKS: {
      BASE: '/tasks',
      BY_ID: (id) => `/tasks/${id}`,
      BY_SUBJECT: (subjectId) => `/tasks/subject/${subjectId}`,
      CREATE: '/tasks',
      UPDATE: (id) => `/tasks/${id}`,
      DELETE: (id) => `/tasks/${id}`,
      UPDATE_STATUS: (id) => `/tasks/${id}/status`,
      COMPLETE: (id) => `/tasks/${id}/complete`,
      BULK_CREATE: '/tasks/bulk',
    },
    
    // Planning
    PLANNING: {
      GENERATE: '/planning/generate',
      OPTIMIZE: '/planning/optimize',
      BY_USER: '/planning/user',
      BY_ID: (id) => `/planning/${id}`,
      UPDATE: (id) => `/planning/${id}`,
      DELETE: (id) => `/planning/${id}`,
    },
    
    // Study Sessions
    SESSIONS: {
      BASE: '/sessions',
      BY_ID: (id) => `/sessions/${id}`,
      CREATE: '/sessions',
      END: (id) => `/sessions/${id}/end`,
      STATS: '/sessions/stats',
      BY_SUBJECT: (subjectId) => `/sessions/subject/${subjectId}`,
    },
    
    // Schedules
    SCHEDULES: {
      LIST: '/api/emplois-du-temps/utilisateur',
      UPLOAD: '/api/emplois-du-temps/upload',
      DELETE: '/api/emplois-du-temps',
      COURSES: '/api/emplois-du-temps',
      ANALYZE: '/api/services/analyser-pdf',
      FREE_SLOTS: '/api/services/creneaux-libres'
    },
    
    // Courses
    COURSES: {
      BASE: '/courses',
      BY_ID: (id) => `/courses/${id}`,
      CREATE: '/courses',
      UPDATE: (id) => `/courses/${id}`,
      DELETE: (id) => `/courses/${id}`,
      UPLOAD_PDF: '/courses/upload-pdf',
      PARSE_PDF: '/courses/parse-pdf',
    },
    
    // Notifications
    NOTIFICATIONS: {
      BASE: '/notifications',
      BY_ID: (id) => `/notifications/${id}`,
      UNREAD: '/notifications/unread',
      MARK_READ: (id) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/mark-all-read',
      DELETE: (id) => `/notifications/${id}`,
    },
    
    // AI Services
    AI: {
      ANALYZE_PDF: '/ai/analyze-pdf',
      GENERATE_SCHEDULE: '/ai/generate-schedule',
      OPTIMIZE_PLANNING: '/ai/optimize-planning',
    },
  },
};

export default API_CONFIG;