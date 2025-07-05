import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mood Tracker API',
      version: '1.0.0',
      description: 'A comprehensive API for mood tracking with user authentication, mood entries, analytics, and trends.',
      contact: {
        name: 'API Support',
        email: 'support@moodtracker.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Mood: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Mood entry ID'
            },
            mood_value: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Mood rating from 1 (worst) to 10 (best)'
            },
            emotions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of emotions experienced'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Additional notes about the mood'
            },
            activities: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Activities performed during the day'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of the mood entry (YYYY-MM-DD)'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Entry creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        MoodAnalytics: {
          type: 'object',
          properties: {
            totalEntries: {
              type: 'integer',
              description: 'Total number of mood entries'
            },
            averageMood: {
              type: 'number',
              format: 'float',
              description: 'Average mood value'
            },
            moodDistribution: {
              type: 'object',
              additionalProperties: {
                type: 'integer'
              },
              description: 'Distribution of mood values'
            },
            moodTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: {
                    type: 'string',
                    description: 'Week identifier'
                  },
                  average: {
                    type: 'number',
                    format: 'float',
                    description: 'Average mood for the week'
                  }
                }
              },
              description: 'Weekly mood trends'
            },
            bestDay: {
              type: 'string',
              format: 'date',
              description: 'Date with the highest mood'
            },
            worstDay: {
              type: 'string',
              format: 'date',
              description: 'Date with the lowest mood'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT access token'
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
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
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };