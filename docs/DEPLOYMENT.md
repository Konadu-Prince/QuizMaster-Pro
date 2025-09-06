# QuizMaster Pro Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- Redis 6+
- Docker and Docker Compose (optional)
- Domain name and SSL certificate (for production)

## Local Development Setup

### 1. Clone and Setup
```bash
git clone <repository-url>
cd QuizMaster-Pro
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizmaster_pro
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### 3. Start Services
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start Backend
cd backend && npm run dev

# Terminal 4: Start Frontend
cd frontend && npm start
```

## Docker Deployment

### 1. Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Individual Services
```bash
# Build backend image
cd backend
docker build -t quizmaster-backend .

# Build frontend image
cd frontend
docker build -t quizmaster-frontend .

# Run with docker-compose
docker-compose up -d
```

## Production Deployment

### 1. Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### 2. Environment Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd QuizMaster-Pro

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Start with PM2
cd backend
pm2 start server.js --name "quizmaster-backend"
pm2 startup
pm2 save
```

### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/quizmaster-pro
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend
    location / {
        root /path/to/QuizMaster-Pro/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance
- Instance Type: t3.medium or larger
- Security Groups: Allow HTTP (80), HTTPS (443), SSH (22)
- Elastic IP for static IP address

#### 2. RDS MongoDB
- Use MongoDB Atlas or AWS DocumentDB
- Configure VPC and security groups
- Enable encryption at rest

#### 3. ElastiCache Redis
- Create Redis cluster
- Configure security groups
- Enable encryption in transit

#### 4. S3 for File Storage
- Create S3 bucket for file uploads
- Configure CORS policy
- Set up CloudFront CDN

### Heroku Deployment

#### 1. Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create quizmaster-pro-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git push heroku main
```

#### 2. Frontend Deployment
```bash
# Create frontend app
heroku create quizmaster-pro-frontend

# Set buildpack
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git

# Set environment variables
heroku config:set REACT_APP_API_URL=https://quizmaster-pro-api.herokuapp.com/api

# Deploy
git push heroku main
```

## Monitoring and Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log management
pm2 logs quizmaster-backend

# Health checks
curl http://localhost:5000/health
```

### 2. Database Maintenance
```bash
# MongoDB backup
mongodump --db quizmaster_pro --out /backup/$(date +%Y%m%d)

# Redis backup
redis-cli BGSAVE
```

### 3. Security Updates
```bash
# Update dependencies
npm audit fix

# Update system packages
sudo apt update && sudo apt upgrade

# Review security logs
sudo tail -f /var/log/auth.log
```

## Performance Optimization

### 1. Database Optimization
- Create appropriate indexes
- Use connection pooling
- Monitor slow queries

### 2. Caching Strategy
- Redis for session storage
- CDN for static assets
- Browser caching headers

### 3. Load Balancing
- Use multiple backend instances
- Configure Nginx load balancer
- Implement health checks

## Backup and Recovery

### 1. Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db quizmaster_pro --out /backup/$DATE
tar -czf /backup/quizmaster_pro_$DATE.tar.gz /backup/$DATE
aws s3 cp /backup/quizmaster_pro_$DATE.tar.gz s3://your-backup-bucket/
```

### 2. Disaster Recovery
- Regular database backups
- Infrastructure as Code (Terraform)
- Multi-region deployment
- Automated failover procedures

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Check connection string
   - Verify network access
   - Check authentication credentials

2. **Redis Connection Issues**
   - Verify Redis is running
   - Check connection URL
   - Review Redis logs

3. **Build Failures**
   - Check Node.js version
   - Clear npm cache
   - Review dependency conflicts

4. **Performance Issues**
   - Monitor resource usage
   - Check database queries
   - Review application logs

### Log Locations
- Application logs: `/var/log/quizmaster-pro/`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`
- System logs: `/var/log/syslog`
