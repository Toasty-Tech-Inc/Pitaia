/* eslint-disable */
import axios from 'axios';

// Configure axios for tests to use.
// This code runs directly when the file is loaded (setupFiles)
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';
axios.defaults.baseURL = `http://${host}:${port}/api`;

// Configurar timeout padrão
axios.defaults.timeout = 10000;

// Não lançar erro para status 4xx e 5xx (para poder testar erros)
axios.defaults.validateStatus = () => true;

// Add response interceptor to unwrap API responses
// API wraps responses in { data: ..., statusCode: ..., timestamp: ... }
axios.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'statusCode' in response.data &&
    'timestamp' in response.data
  ) {
    // Unwrap the response, keeping the original structure but replacing data
    response.data = response.data.data;
  }
  return response;
});

console.log('Setting up...');
console.log(`Connecting on ${host}:${port}/api`);
