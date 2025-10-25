import { ScheduledHandler } from 'aws-lambda';

export const handler: ScheduledHandler = async (event) => {
  console.log('Running sales aggregation ETL...');
  
  // TODO: Agregar vendas do Postgres para MongoDB
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Sales aggregation completed',
    }),
  };
};
