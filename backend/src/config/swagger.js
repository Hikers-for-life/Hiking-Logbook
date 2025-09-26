import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hiking Logbook Public API',
      version: '1.0.0',
      description: `
# Hiking Logbook Public API

Welcome to the Hiking Logbook Public API! This API provides access to hiking data and statistics from our platform.

## Getting Started

### Authentication
Most endpoints are public and don't require authentication. For endpoints that submit data (like POST /api/public/hikes), you'll need an API key.

**Demo API Keys (for testing):**
- Full Access: \`demo-key-12345\` (read + write permissions)
- Read Only: \`readonly-key-67890\` (read permissions only)

**To get a production API key:**
1. Contact our development team
2. Include your use case and expected usage
3. We'll provide you with a production API key

**Using your API key:**
Include it in the request headers:
\`\`\`
X-API-Key: demo-key-12345
\`\`\`

### Base URL
- **Production**: https://your-render-app.onrender.com
- **Development**: http://localhost:3001

### Rate Limits
- 100 requests per minute for public endpoints
- 50 requests per minute for data submission endpoints

### Support
For questions or support, contact: your-email@example.com
      `,
      contact: {
        name: 'Hiking Logbook API Support',
        email: 'support@hikinglogbook.com',
        url: 'https://hiking-logbook-hezw.onrender.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://hiking-logbook-hezw.onrender.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for accessing protected endpoints'
        }
      },
      schemas: {
        HikeData: {
          type: 'object',
          required: ['externalUserId', 'title', 'location'],
          properties: {
            externalUserId: {
              type: 'string',
              description: 'Your system\'s user identifier',
              example: 'user123'
            },
            title: {
              type: 'string',
              description: 'Name of the hike',
              example: 'Morning Mountain Trail'
            },
            location: {
              type: 'string',
              description: 'Location where the hike took place',
              example: 'Table Mountain, Cape Town'
            },
            distance: {
              type: 'number',
              description: 'Distance in kilometers',
              example: 12.5
            },
            elevation: {
              type: 'number',
              description: 'Elevation gain in meters',
              example: 800
            },
            difficulty: {
              type: 'string',
              enum: ['Easy', 'Moderate', 'Hard'],
              description: 'Difficulty level of the hike',
              example: 'Moderate'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of the hike',
              example: '2024-01-15T08:00:00Z'
            },
            duration: {
              type: 'number',
              description: 'Duration in hours',
              example: 4.5
            },
            weather: {
              type: 'string',
              description: 'Weather conditions during the hike',
              example: 'Sunny, 22°C'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the hike',
              example: 'Beautiful views at the summit!'
            }
          }
        },
        Badge: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Badge name',
              example: 'First Steps'
            },
            description: {
              type: 'string',
              description: 'Badge description',
              example: 'Completed your very first hike'
            },
            category: {
              type: 'string',
              description: 'Badge category',
              example: 'achievement'
            },
            difficulty: {
              type: 'string',
              description: 'Badge difficulty',
              example: 'standard'
            }
          }
        },
        Location: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Location name',
              example: 'Table Mountain Trail'
            },
            region: {
              type: 'string',
              description: 'Geographic region',
              example: 'Western Cape'
            },
            hikesLogged: {
              type: 'number',
              description: 'Number of hikes logged at this location',
              example: 45
            },
            averageDifficulty: {
              type: 'string',
              description: 'Average difficulty of hikes at this location',
              example: 'Moderate'
            },
            averageDistance: {
              type: 'number',
              description: 'Average distance of hikes at this location (km)',
              example: 8.5
            },
            lastHiked: {
              type: 'string',
              format: 'date-time',
              description: 'Date of most recent hike at this location',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        GlobalStats: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'number',
              description: 'Total number of registered users',
              example: 1250
            },
            totalHikes: {
              type: 'number',
              description: 'Total number of hikes logged',
              example: 5430
            },
            totalDistance: {
              type: 'number',
              description: 'Total distance hiked across all users (km)',
              example: 45230.5
            },
            totalElevation: {
              type: 'number',
              description: 'Total elevation gained across all hikes (m)',
              example: 890450
            },
            monthlyActivity: {
              type: 'array',
              description: 'Monthly hiking activity data',
              items: {
                type: 'object',
                properties: {
                  month: {
                    type: 'string',
                    example: '2024-01'
                  },
                  hikes: {
                    type: 'number',
                    example: 245
                  },
                  distance: {
                    type: 'number',
                    example: 1850.5
                  }
                }
              }
            },
            popularDifficulties: {
              type: 'object',
              properties: {
                Easy: { type: 'number', example: 1200 },
                Moderate: { type: 'number', example: 2800 },
                Hard: { type: 'number', example: 1300 }
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Response message'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints'
      },
      {
        name: 'Statistics',
        description: 'Global hiking statistics and trends'
      },
      {
        name: 'Badges',
        description: 'Achievement badges and gamification'
      },
      {
        name: 'Locations',
        description: 'Popular hiking locations and data'
      },
      {
        name: 'Data Submission',
        description: 'Submit hiking data from external systems'
      }
    ]
  },
  apis: ['./src/routes/public.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
