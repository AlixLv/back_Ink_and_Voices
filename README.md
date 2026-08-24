# Ink & Voices - Backend

A collaborative database platform dedicated to promoting and cataloging works by women authors and authors from gender minorities.

## About the Project

This project was born from a personal need we encountered during our initial RNCP6 project development. We realized there was a significant lack of representation of women and gender minority authors in the most commonly used databases.

Our goal is to create an inclusive, community-driven database that addresses this gap and makes diverse literature more discoverable for everyone.

### Key Features

- **Collaborative Contributions**: Community members can propose books to add to the database
- **Moderation System**: Administrators review and validate or reject submissions
- **RESTful API**: Developers can access books, themes, types, and user data
- **User Authentication**: Secure JWT-based authentication with HTTP-only cookies
- **Focus on Representation**: Dedicated to highlighting women authors and gender minorities

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 24.x |
| **Framework** | Fastify | 5.6.2 |
| **Language** | TypeScript | 5.9.3 |
| **Database** | PostgreSQL | 16-alpine |
| **ORM** | Prisma | 7.2.0 |
| **Validation** | Zod | 4.3.6 |
| **Auth** | JWT + HTTP-Only Cookies | - |
| **Testing** | Vitest | 4.1.0 |
| **Container** | Docker + Docker Compose | Latest |

---

## Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Docker & Docker Compose** ([Install](https://www.docker.com/products/docker-desktop))
- **Node.js 24+** ([Install](https://nodejs.org/))
- **Git** ([Install](https://git-scm.com/))
- **npm** (comes with Node.js)

### Installation

#### Clone the repository
```bash
git clone https://github.com/your-org/ink-and-voices.git
cd back_Ink_and_Voices
```

#### Setup environment variables
```bash
# Copy the example file
cp .env.example .env.development
```

#### Start Docker services

```bash
#create image
docker-compose --build

# Start PostgreSQL + pgAdmin + dev server
docker-compose up

# Or run in background
docker-compose up -d
```

Wait for output: `Server listening at http://0.0.0.0:8032`

#### Verify installation
```bash
# Health check
curl http://localhost:8032/api/auth/

# Response
{"message":"/ route hit success"}
```

#### Access tools
- **API**: http://localhost:8032
- **API Docs**: http://localhost:8032/swagger
- **pgAdmin**: http://localhost:5050 (email: `admin@example.com`, password: `admin`)

---

## Common Commands

### Development

```bash
# Start all services (Docker)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f dev

# Stop services
docker-compose down

# Reset database (remove volume)
docker-compose down -v
```

### Application

```bash
# Start dev server (watch mode)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

### Database

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode (re-run on change)
npm run test:watch

# Generate coverage report
npm run coverage

# Run single test file
npm test -- src/modules/auth/tests/auth.routes.test.ts
```
---

## Project Structure

```
back_Ink_and_Voices/
│
├──Core Files
│   ├── README.md                      # This file
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── vitest.config.ts               # Test runner config
│   ├── vite.config.ts                 # Build config
│   └── Taskfile.yml                   # Task automation
│
├──Docker & Deployment
│   ├── Dockerfile                     # Multi-stage build
│   ├── docker-compose.yml             # Local dev setup
│   ├── .dockerignore                  # Docker build cache
│   └── init-db.sql                    # Initial DB schema
│
├──Configuration
│   ├── .env.example                   # Template (versionned)
│   ├── prisma.config.ts               # Prisma env config
│   └── .github/workflows/             # CI/CD pipeline
│
├──Database
│   └── prisma/
│       ├── schema.prisma              # Data models
│       ├── seed.ts                    # Seed data
│       └── migrations/                # Database migrations
│
├──Source
│   └── src/
│       ├── index.ts                   # Application bootstrap
│       │
│       ├── config/                    # Configuration files
│       │   └── supabase.config.ts
│       │
│       ├── errors/                    # Custom error classes
│       │   └── ApiError.ts
│       │
│       ├── generated/                 # Auto-generated Prisma client
│       │   └── prisma/
│       │       ├── client.ts
│       │       ├── models.ts
│       │       └── enums.ts
│       │
│       ├── modules/                   # Feature modules (MVC pattern)
│       │   ├── auth/
│       │   ├── book/
│       │   └── user/
│       ├── types/                     # TypeScript type definitions│       │
└── .gitignore                         # Ignored files
```

### Module Structure

Each feature module follows a consistent pattern:

```
modules/auth/
├── auth.schema.ts        # Zod schemas (input validation + output filtering)
├── auth.controller.ts    # Business logic (handlers)
├── auth.routes.ts        # Route definitions
├── auth.errors.ts        # Custom error classes
└── tests/
    ├── auth.controller.test.ts  # Unit tests (with mocks)
    └── auth.routes.test.ts      # Integration tests (real DB)
```

## Testing Strategy

### Running Tests

```bash
# All tests
npx task run-tests
```

We welcome contributions from the community! Whether you're adding books, improving code, or fixing bugs, your help is appreciated.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

## Team

This project is being developed as part of our RNCP6 certification.

- [Alix Levé](https://github.com/AlixLv)
- [Térence Da Conceiçao](https://github.com/terence-da-conceicao)
- [Lauriane Marques](https://github.com/Lauriane-Marques)

## Contact

For questions or suggestions, please reach out to inkandvoices264@gmail.com

## Acknowledgments

- Thanks to all contributors who help make literature more diverse and accessible
- Inspired by the need for better representation in technology and literature

---

**Note**: This project is currently in active development as part of our RNCP6 certification program.