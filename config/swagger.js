import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mood Tracker API',
      version: '1.0.0',
      description: 'API completa para rastreamento de humor com autenticação JWT e análises avançadas',
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
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@email.com'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação da conta'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        Mood: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do registro de humor'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Valor do humor de 1 a 10',
              example: 8
            },
            note: {
              type: 'string',
              description: 'Notas adicionais sobre o humor',
              example: 'Dia produtivo no trabalho'
            },
            tag_ids: {
              type: 'array',
              items: {
                type: 'integer'
              },
              description: 'Lista de IDs das tags associadas ao humor',
              example: [1, 3, 7]
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Data do registro',
              example: '2023-12-01'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do registro'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
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
        MoodResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Mood entry created successfully'
            },
            data: {
              type: 'object',
              properties: {
                mood: {
                  $ref: '#/components/schemas/Mood'
                }
              }
            }
          }
        },
        MoodListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                moods: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Mood'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    limit: {
                      type: 'integer',
                      example: 50
                    },
                    offset: {
                      type: 'integer',
                      example: 0
                    },
                    total: {
                      type: 'integer',
                      example: 25
                    }
                  }
                }
              }
            }
          }
        },
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID da tag'
            },
            tag_name: {
              type: 'string',
              description: 'Nome da tag',
              example: 'Foco'
            },
            group_id: {
              type: 'integer',
              description: 'ID do grupo ao qual a tag pertence'
            }
          }
        },

        TagResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Tag'
            }
          }
        },

        TagListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              }
            }
          }
        },

        GroupWithTags: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID do grupo'
            },
            group_name: {
              type: 'string',
              description: 'Nome do grupo',
              example: 'Trabalho'
            },
            tags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    description: 'ID da tag'
                  },
                  tag_name: {
                    type: 'string',
                    description: 'Nome da tag'
                  }
                }
              }
            }
          }
        },

        GroupTagListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/GroupWithTags'
              }
            }
          }
        },
        Analytics: {
          type: 'object',
          properties: {
            totalEntries: {
              type: 'integer',
              description: 'Total de registros de humor',
              example: 30
            },
            averageMood: {
              type: 'number',
              description: 'Humor médio no período',
              example: 7.5
            },
            moodDistribution: {
              type: 'object',
              description: 'Distribuição dos valores de humor',
              example: {
                "1": 2,
                "2": 1,
                "7": 8,
                "8": 12,
                "9": 5,
                "10": 2
              }
            },
            moodTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: {
                    type: 'string',
                    example: '2023-W48'
                  },
                  average: {
                    type: 'number',
                    example: 7.8
                  }
                }
              }
            },
            bestDay: {
              type: 'string',
              format: 'date',
              example: '2023-12-01'
            },
            worstDay: {
              type: 'string',
              format: 'date',
              example: '2023-11-15'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
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
  apis: ['./routes/*.js', './controllers/*.js'], // Caminhos para os arquivos com anotações JSDoc
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };