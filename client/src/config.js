const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://backend.novadrive.space' 
  : 'https://localhost:3000';

export default BASE_URL;