# LeetCode Backend System

A scalable microservices-based backend system for running and evaluating code submissions, similar to LeetCode. Built with Node.js, TypeScript, and Docker.

## 🏗️ Architecture

This system consists of three main microservices:

| Service | Port | Description | Database |
|---------|------|-------------|----------|
| **Problem Service** | 3001 | Manages coding problems, test cases, and problem metadata | MongoDB |
| **Submission Service** | 3002 | Handles code submissions, user data, and submission status | MongoDB |
| **Evaluation Service** | 3003 | Executes code in isolated containers and evaluates results | None (stateless) |

### 🔧 Supporting Infrastructure

- **MongoDB**: Primary database for problem and submission data
- **Redis**: Message queue and caching layer (BullMQ)
- **Docker-in-Docker**: Isolated code execution environment
- **Winston**: Structured logging with daily rotation

## 🚀 Features

- **Multi-language Support**: Execute code in JavaScript, C++, and Python
- **Isolated Execution**: Secure code execution using Docker containers
- **Asynchronous Processing**: Queue-based job processing with BullMQ
- **Comprehensive Logging**: Structured logging with correlation IDs
- **Health Checks**: Service health monitoring and dependency management
- **Scalable Architecture**: Designed for horizontal scaling

## 💻 Supported Languages

| Language | Timeout | Docker Image | Description |
|----------|---------|--------------|-------------|
| **JavaScript** | 10 seconds | Node.js | JavaScript/Node.js code execution |
| **C++** | 10 seconds | GCC | C++ code compilation and execution |
| **Python** | 40 seconds | Python 3 | Python code execution |

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)
- Redis (if running locally)

## 🛠️ Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhi-wolf/leetcode_node_backend
   cd leetcode_node_backend
   ```

2. **Start all services**
   ```bash
   # Production build
   docker-compose up -d

   # Development with hot reload
   docker-compose -f compose-dev.yaml up -d
   ```

3. **Verify services are running**
   ```bash
   curl http://localhost:3001/api/v1/health  # Problem Service
   curl http://localhost:3002/api/v1/health  # Submission Service
   curl http://localhost:3003/api/v1/health  # Evaluation Service
   ```

### Local Development

1. **Install dependencies for each service**
   ```bash
   cd problem_service && npm install
   cd ../submission_service && npm install
   cd ../evaluation_service && npm install
   ```

2. **Start MongoDB and Redis**
   ```bash
   docker-compose up -d mongo redis
   ```

3. **Run services**
   ```bash
   # Terminal 1
   cd problem_service && npm run dev

   # Terminal 2
   cd submission_service && npm run dev

   # Terminal 3
   cd evaluation_service && npm run dev
   ```


## 🔌 API Endpoints

### Problem Service (Port 3001)
- `GET /api/v1/problems/search` - List all problems and search by query
- `GET /api/v1/problems/:id` - Get problem by ID
- `POST /api/v1/problems` - Create new problem
- `PUT /api/v1/problems/:id` - Update problem
- `DELETE /api/v1/problems/:id` - Delete problem
- `GET /api/v1/health` - Health check

### Submission Service (Port 3002)
- `POST /api/v1/submissions` - create new submission
- `GET /api/v1/submissions/:id` - Get submission details
- `GET /api/v1/health` - Health check

### Evaluation Service (Port 3003)
- `GET /api/v1/health` - Health check

## ⚙️ Configuration

Environment variables can be set in `.env` files or Docker Compose:

### Language Configuration
Language-specific settings are configured in `evaluation_service/src/config/language.config.ts`:

- **JavaScript**: 10 second execution timeout
- **C++**: 10 second execution timeout
- **Python**: 40 second execution timeout

## 🔍 Monitoring & Logging

- **Winston Logger**: Structured logging with daily rotation
- **Correlation IDs**: Request tracking across services
- **Health Checks**: `/api/v1/health` endpoints
- **Morgan Middleware**: HTTP request logging
- **Queue Monitoring**: BullMQ job status and metrics

## 🧪 Testing

```bash
# Run tests for all services
npm run test

# Run tests for specific service
cd problem_service && npm run test
```

## 📈 Scaling Considerations

The architecture supports horizontal scaling with these considerations:

- **Queue Names**: Use unique queue names per instance to avoid conflicts
- **Load Balancing**: Implement API gateway or load balancer for multiple instances
- **Database Connections**: Configure connection pooling for MongoDB
- **Resource Limits**: Set appropriate CPU/memory limits for containers
- **Language Workers**: Scale evaluation service based on language-specific load


## 📄 License

This project is licensed under the ISC License - see the package.json file for details.


### Logs

```bash
# View service logs
docker-compose logs problem-service
docker-compose logs submission-service
docker-compose logs evaluation-service

# View all logs
docker-compose logs -f
```

### Language-Specific Debugging

```bash
# Check language configuration
cat evaluation_service/src/config/language.config.ts

# View evaluation worker logs
docker-compose logs evaluation-service | grep "Evaluation"
```