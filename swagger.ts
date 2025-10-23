import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Fortheweebs API', version: '1.0.0' },
  },
  apis: ['./routes/*.ts'],
});

export function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}
