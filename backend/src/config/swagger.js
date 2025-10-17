import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hiking Logbook Public API',
      version: '1.0.0',
      description: `Interactive API documentation for the Hiking Logbook Public API.

## Demo API Keys
- **Full Access**: \`demo-key-12345\` (read + write permissions)
- **Read Only**: \`readonly-key-67890\` (read permissions only)

## Getting Started
1. Click "Authorize" button above
2. Enter one of the demo API keys
3. Test the endpoints using the "Try it out" buttons

## Base URLs
- **Production**: https://hiking-logbook-hezw.onrender.com
- **Development**: http://localhost:3001`,
      contact: {
        name: 'Hiking Logbook API Documentation',
        url: 'https://hiking-logbook-hezw.onrender.com/api-docs',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://hiking-logbook-hezw.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description:
            'API key for accessing protected endpoints. Use demo-key-12345 (full access) or readonly-key-67890 (read-only) for testing.',
        },
      },
      schemas: {
        HikeData: {
          type: 'object',
          required: ['externalUserId', 'title', 'location'],
          properties: {
            externalUserId: {
              type: 'string',
              description: "Your system's user identifier",
              example: 'user123',
            },
            title: {
              type: 'string',
              description: 'Name of the hike',
              example: 'Morning Mountain Trail',
            },
            location: {
              type: 'string',
              description: 'Location where the hike took place',
              example: 'Table Mountain, Cape Town',
            },
            distance: {
              type: 'number',
              description: 'Distance in kilometers',
              example: 12.5,
            },
            elevation: {
              type: 'number',
              description: 'Elevation gain in meters',
              example: 800,
            },
            difficulty: {
              type: 'string',
              enum: ['Easy', 'Moderate', 'Hard'],
              description: 'Difficulty level of the hike',
              example: 'Moderate',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of the hike',
              example: '2024-01-15T08:00:00Z',
            },
            duration: {
              type: 'number',
              description: 'Duration in hours',
              example: 4.5,
            },
            weather: {
              type: 'string',
              description: 'Weather conditions during the hike',
              example: 'Sunny, 22°C',
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the hike',
              example: 'Beautiful views at the summit!',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error information',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Check if the API is working and get service status',
      },
      {
        name: 'Statistics',
        description:
          'Get global hiking statistics, user counts, and activity trends',
      },
      {
        name: 'Badges',
        description: 'View available achievement badges and their requirements',
      },
      {
        name: 'Locations',
        description: 'Get popular hiking locations with statistics and data',
      },
      {
        name: 'Data Submission',
        description:
          'Submit hike data from external systems (requires API key)',
      },
    ],
  },
  apis: ['./src/routes/public.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
