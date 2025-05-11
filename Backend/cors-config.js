module.exports = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      const allowedOrigins = [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Backend server
        'http://localhost:3001',  // Any other potential frontend port
        undefined  // For non-browser requests
      ];
  
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Access-Control-Allow-Origin'
    ],
    credentials: true
  };