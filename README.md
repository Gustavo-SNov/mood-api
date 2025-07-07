# Mood Tracker API

Uma API completa para rastreamento de humor construída com Node.js, Express e SQLite3.

## Integrantes:

- Gustavo da Silva Novais - SP3119459
- João Vitor Leal de Castro - SP3122972
- Pedro Barros Zich - SP3120236
- Sthefany Cristovam da Silva - SP3121658


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

## 📦 Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd mood-api
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

```

## 🛠️ Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint    | Descrição               |
| ------ | ----------- | ----------------------- |
| POST   | `/register` | Registrar novo usuário  |
| POST   | `/login`    | Fazer login             |


### Autenticação (`/api/user`)

| Método | Endpoint    | Descrição               |
| ------ | ----------- | ----------------------- |
| POST   | `/refresh`  | Renovar token           |
| POST   | `/logout`   | Fazer logout            |
| GET    | `/verify`   | Verificar token         |
| GET    | `/`         | Obter perfil do usuário |
| PUT    | `/`         | Atualizar perfil        |

### Humor (`/api/moods`)

| Método | Endpoint     | Descrição              |
| ------ | ------------ | ---------------------- |
| GET    | `/`          | Listar humores         |
| GET    | `/:id`       | Obter humor específico |
| POST   | `/`          | Criar novo humor       |
| PUT    | `/:id`       | Atualizar humor        |
| DELETE | `/:id`       | Deletar humor          |
| GET    | `/analytics` | Obter análises         |

## 🏗️ Estrutura do Projeto

```
├── config/
│   ├── database.js          # Configuração do SQLite
│   └── jwt.js               # Configuração do JWT
├── controllers/
│   ├── authController.js    # Controladores de autenticação
│   ├── userController.js    # Controladores de Usuário
│   ├── tagController.js     # Controladores de Tags
│   └── moodController.js    # Controladores de humor
│ 
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   ├── errorHandler.js      # Tratamento de erros
│   └── notFound.js          # Middleware 404
├── models/
│   ├── User.js              # Modelo de usuário
│   ├── Mood.js              # Modelo de humor
│   ├── Tag.js               # Modelo de tag
│   └── RefreshToken.js      # Modelo de refresh token
├── routes/
│   ├── authRoutes.js        # Rotas de autenticação
│   ├── moodRoutes.js        # Rotas de mood
│   ├── tagsRoutes.js        # Rotas de tags
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

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT tokens com expiração
- ✅ Refresh tokens seguros
- ✅ Validação de dados
- ✅ CORS configurado

## 🌍 Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE.txt para detalhes.
