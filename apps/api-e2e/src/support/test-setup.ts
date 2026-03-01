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

console.log('Setting up...');
console.log(`Connecting on ${host}:${port}/api`);
