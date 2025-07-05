# Mood Tracker API

Uma API completa para rastreamento de humor construída com Node.js, Express e SQLite3.

## Funcionalidades

### 🔐 Autenticação
- Registro e login de usuários
- JWT tokens com refresh tokens
- Verificação de tokens
- Gerenciamento de perfil

### 📊 Rastreamento de Humor
- CRUD completo para entradas de humor
- Validação de dados
- Análises e tendências
- Filtragem por data

### 📈 Analytics
- Estatísticas de humor
- Tendências por período
- Distribuição de humor
- Melhores e piores dias

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd mood-tracker-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Registrar novo usuário |
| POST | `/login` | Fazer login |
| POST | `/refresh` | Renovar token |
| POST | `/logout` | Fazer logout |
| GET | `/verify` | Verificar token |
| GET | `/profile` | Obter perfil do usuário |
| PUT | `/profile` | Atualizar perfil |

### Humor (`/api/moods`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Listar humores |
| GET | `/:id` | Obter humor específico |
| POST | `/` | Criar novo humor |
| PUT | `/:id` | Atualizar humor |
| DELETE | `/:id` | Deletar humor |
| GET | `/analytics` | Obter análises |
| GET | `/trends` | Obter tendências |

## Estrutura do Projeto

```
├── config/
│   └── database.js          # Configuração do SQLite
├── controllers/
│   ├── authController.js    # Controladores de autenticação
│   └── moodController.js    # Controladores de humor
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   ├── errorHandler.js      # Tratamento de erros
│   └── notFound.js          # Middleware 404
├── models/
│   ├── User.js              # Modelo de usuário
│   ├── Mood.js              # Modelo de humor
│   └── RefreshToken.js      # Modelo de refresh token
├── routes/
│   ├── authRoutes.js        # Rotas de autenticação
│   └── moodRoutes.js        # Rotas de humor
├── utils/
│   ├── validators.js        # Validadores
│   └── responses.js         # Helpers de resposta
├── database/
│   └── mood_tracker.db      # Banco SQLite (gerado automaticamente)
├── .env                     # Variáveis de ambiente
├── server.js                # Servidor principal
└── README.md
```

## Modelos de Dados

### Usuário
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### Humor
```json
{
  "id": 1,
  "mood_value": 8,
  "emotions": ["feliz", "motivado"],
  "notes": "Dia produtivo no trabalho",
  "activities": ["trabalho", "exercício"],
  "date": "2023-01-01",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Exemplos de Uso

### Registro de Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

### Criar Entrada de Humor
```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mood_value": 8,
    "emotions": ["feliz", "motivado"],
    "notes": "Dia produtivo",
    "activities": ["trabalho", "exercício"]
  }'
```

## Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT tokens com expiração
- ✅ Refresh tokens seguros
- ✅ Rate limiting
- ✅ Helmet para cabeçalhos de segurança
- ✅ Validação de dados
- ✅ CORS configurado

## Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
DB_PATH=./database/mood_tracker.db
CORS_ORIGIN=http://localhost:5173
```

## Licença

MIT