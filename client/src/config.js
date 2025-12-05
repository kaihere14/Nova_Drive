const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://64.227.129.180' 
  : 'http://localhost:3000';

export default BASE_URL;