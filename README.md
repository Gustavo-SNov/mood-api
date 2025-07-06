# Mood Tracker API

Uma API completa para rastreamento de humor construída com Node.js, Express e SQLite3, com documentação interativa Swagger.

## O que falta:

- Tags são atividades
- Atividades são retornados -> Array de Tags
- Cada Tag: Tag = { Icone, Nome, Grupo}
- Tag.Grupo não será retornado na Requisição
- Grupo é uma FK da Tag
- Criar GET para Grupo de Tags
- No Mood um array de Tags
- Login retorna um Token somente e apenas
- Register não retorna nada, apenas uma mensagem de sucesso!
- DELETE NO USER

## 🚀 Funcionalidades

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

### 📚 Documentação

- Swagger UI interativo
- Documentação completa da API
- Exemplos de uso
- Teste direto dos endpoints

## 📦 Instalação

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

## 📖 Documentação da API

Após iniciar o servidor, acesse a documentação interativa:

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

A documentação Swagger inclui:

- ✅ Todos os endpoints disponíveis
- ✅ Esquemas de dados detalhados
- ✅ Exemplos de requisições e respostas
- ✅ Teste interativo dos endpoints
- ✅ Autenticação JWT integrada
- ✅ Códigos de status e tratamento de erros

## 🛠️ Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint    | Descrição               |
| ------ | ----------- | ----------------------- |
| POST   | `/register` | Registrar novo usuário  |
| POST   | `/login`    | Fazer login             |
| POST   | `/refresh`  | Renovar token           |
| POST   | `/logout`   | Fazer logout            |
| GET    | `/verify`   | Verificar token         |
| GET    | `/profile`  | Obter perfil do usuário |
| PUT    | `/profile`  | Atualizar perfil        |

### Humor (`/api/moods`)

| Método | Endpoint     | Descrição              |
| ------ | ------------ | ---------------------- |
| GET    | `/`          | Listar humores         |
| GET    | `/:id`       | Obter humor específico |
| POST   | `/`          | Criar novo humor       |
| PUT    | `/:id`       | Atualizar humor        |
| DELETE | `/:id`       | Deletar humor          |
| GET    | `/analytics` | Obter análises         |
| GET    | `/trends`    | Obter tendências       |

## 🏗️ Estrutura do Projeto

```
├── config/
│   ├── database.js          # Configuração do SQLite
│   └── swagger.js           # Configuração do Swagger
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

## 📊 Modelos de Dados

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
  "rating": 8,
  "emotions": ["feliz", "motivado"],
  "note": "Dia produtivo no trabalho",
  "activities": ["trabalho", "exercício"],
  "date": "2023-01-01",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## 🧪 Testando a API

### Via Swagger UI (Recomendado)

1. Acesse http://localhost:3000/api-docs
2. Clique em "Authorize" e insira seu token JWT
3. Teste qualquer endpoint diretamente na interface

### Via cURL

#### Registro de Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

#### Criar Entrada de Humor

```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 8,
    "emotions": ["feliz", "motivado"],
    "note": "Dia produtivo",
    "activities": ["trabalho", "exercício"]
  }'
```

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT tokens com expiração
- ✅ Refresh tokens seguros
- ✅ Rate limiting
- ✅ Helmet para cabeçalhos de segurança
- ✅ Validação de dados
- ✅ CORS configurado
- ✅ Documentação protegida

## 🌍 Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
DB_PATH=./database/mood_tracker.db
CORS_ORIGIN=http://localhost:5173
API_URL=http://localhost:3000
```

## 📝 Licença

MIT

---

## 🎯 Próximos Passos

1. **Acesse a documentação**: http://localhost:3000/api-docs
2. **Teste os endpoints** diretamente no Swagger UI
3. **Integre com seu frontend** usando os exemplos fornecidos
4. **Monitore** via health check: http://localhost:3000/api/health

A documentação Swagger torna a API muito mais fácil de entender e usar! 🚀
