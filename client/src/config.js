const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://curves-selection-staffing-canvas.trycloudflare.com' 
  : 'http://localhost:3000';

export default BASE_URL;