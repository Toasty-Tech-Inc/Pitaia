/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
  
  // Configurar timeout padrão
  axios.defaults.timeout = 10000;
  
  // Não lançar erro para status 4xx e 5xx (para poder testar erros)
  axios.defaults.validateStatus = () => true;
};
