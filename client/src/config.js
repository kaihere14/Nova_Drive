const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nova-drive-backend.vercel.app' 
  : 'http://localhost:3000';

export default BASE_URL;