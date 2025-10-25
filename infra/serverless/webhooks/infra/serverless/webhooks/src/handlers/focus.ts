import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('iFood webhook received:', event.body);
  
  // TODO: Processar webhook e publicar no RabbitMQ
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Webhook processed successfully',
    }),
  };
};
