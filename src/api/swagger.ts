export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AIMleap QueueJob API',
    version: '1.0.0',
    description: 'HTTP API for queue job creation, listing, status, and metrics.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Jobs', description: 'Job lifecycle endpoints' },
    { name: 'Health', description: 'Service health and metrics' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'secret' },
        },
        required: ['username', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
      },
      CreateJobRequest: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['email', 'sms', 'image', 'webhook', 'custom'],
          },
          priority: {
            type: 'string',
            enum: ['high', 'normal', 'low'],
          },
          payload: {
            type: 'object',
            description: 'Arbitrary payload object for the job',
            additionalProperties: true,
          },
          delay: { type: 'number', description: 'Delay in milliseconds before the job may run' },
          runAt: { type: 'string', format: 'date-time' },
          maxRetries: { type: 'number', minimum: 0, maximum: 10 },
          idempotencyKey: { type: 'string', maxLength: 128 },
        },
        required: ['type', 'payload'],
      },
      CreateJobResponse: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          status: { type: 'string', example: 'queued' },
        },
      },
      JobRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: ['email', 'sms', 'image', 'webhook', 'custom'],
          },
          priority: { type: 'number' },
          payload: { type: 'object', additionalProperties: true },
          status: {
            type: 'string',
            enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
          },
          retry_count: { type: 'number' },
          max_retries: { type: 'number' },
          delay_until: { type: ['string', 'null'], format: 'date-time' },
          idempotency_key: { type: ['string', 'null'] },
          result: { type: ['object', 'string', 'number', 'boolean', 'null'], nullable: true },
          last_error: { type: ['string', 'null'] },
          created_at: { type: 'string', format: 'date-time' },
          started_at: { type: ['string', 'null'], format: 'date-time' },
          completed_at: { type: ['string', 'null'], format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      JobListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/JobRecord' },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              pageSize: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive a JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '400': { description: 'Invalid request' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/jobs': {
      post: {
        tags: ['Jobs'],
        summary: 'Create a new queue job',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateJobRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Job created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateJobResponse' },
              },
            },
          },
          '400': { description: 'Invalid input' },
          '401': { description: 'Unauthorized' },
        },
      },
      get: {
        tags: ['Jobs'],
        summary: 'List jobs with optional filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            },
            required: false,
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            required: false,
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            required: false,
          },
        ],
        responses: {
          '200': {
            description: 'Job listing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobListResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get a job by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Job details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobRecord' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Job not found' },
        },
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Cancel a queued job',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Cancelled successfully' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Job not found' },
          '409': { description: 'Job cannot be cancelled' },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/metrics': {
      get: {
        tags: ['Health'],
        summary: 'Prometheus metrics endpoint',
        responses: {
          '200': {
            description: 'Prometheus metrics text',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};
