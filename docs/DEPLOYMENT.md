# Deployment Guide

## Prerequisites

Before deploying RestaurantPro, ensure you have:

- Node.js 16+ installed
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL database
- Redis server
- Domain name (for production)
- SSL certificate (for HTTPS)

## Environment Setup

1. **Clone and Configure**
```bash
git clone https://github.com/yourusername/restaurant-pro.git
cd restaurant-pro
cp .env.example .env
```

2. **Update Environment Variables**
Edit `.env` file with your production values:
```bash
# Database
DATABASE_URL=postgresql://user:password@your-db-host:5432/restaurant_db

# Redis
REDIS_URL=redis://your-redis-host:6379

# JWT
JWT_SECRET=your-super-secure-secret-key

# Email
SMTP_HOST=your-smtp-host
SMTP_USER=your-email
SMTP_PASS=your-password

# Payment
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Production Build**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

2. **Database Migration**
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Option 2: Manual Deployment

#### Backend Deployment

1. **Install Dependencies**
```bash
cd backend
npm ci --production
```

2. **Build Application**
```bash
npm run build
```

3. **Database Setup**
```bash
npm run migrate
npm run seed
```

4. **Start Application**
```bash
npm start
```

#### Frontend Deployment

1. **Build for Production**
```bash
cd frontend
npm ci
npm run build
```

2. **Serve Static Files**
```bash
# Using serve
npm install -g serve
serve -s build -l 3000

# Or copy build folder to your web server
cp -r build/* /var/www/html/
```

### Option 3: Cloud Deployment

#### Vercel (Frontend)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

#### Railway (Backend)

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Deploy**
```bash
cd backend
railway login
railway init
railway up
```

#### Heroku (Full Stack)

1. **Prepare for Heroku**
```bash
# Add Procfile
echo "web: npm start" > backend/Procfile

# Add engines to package.json
```

2. **Deploy**
```bash
heroku create restaurant-pro-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

## Database Setup

### PostgreSQL

1. **Create Database**
```sql
CREATE DATABASE restaurant_db;
CREATE USER restaurant_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;
```

2. **Run Migrations**
```bash
npm run migrate
```

3. **Seed Data**
```bash
npm run seed
```

### Redis

1. **Install Redis**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS
brew install redis

# Docker
docker run -d -p 6379:6379 redis:6-alpine
```

## SSL Configuration

### Let's Encrypt (Free SSL)

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/restaurant-pro/frontend/build;
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

## Monitoring and Maintenance

### PM2 (Process Management)

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create Ecosystem File**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'restaurant-pro-backend',
    script: 'dist/index.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

3. **Start Application**
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Health Checks

1. **Backend Health Endpoint**
```bash
curl https://your-domain.com/api/health
```

2. **Database Connection**
```bash
curl https://your-domain.com/api/health/db
```

### Backup Strategy

1. **Database Backup**
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/restaurant-pro"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql
```

2. **File Backup**
```bash
# Backup uploads
tar -czf uploads_backup_$DATE.tar.gz uploads/
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Security**
   - Use SSL connections
   - Restrict database access
   - Regular security updates

3. **Application Security**
   - Enable CORS for trusted domains only
   - Use HTTPS everywhere
   - Implement rate limiting
   - Regular dependency updates

## Performance Optimization

1. **Database Optimization**
   - Add proper indexes
   - Use connection pooling
   - Implement query optimization

2. **Caching Strategy**
   - Redis for session storage
   - Cache frequently accessed data
   - CDN for static assets

3. **Frontend Optimization**
   - Code splitting
   - Image optimization
   - Gzip compression

## Troubleshooting

### Common Issues

1. **Database Connection Error**
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql $DATABASE_URL
```

2. **Redis Connection Error**
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

3. **Permission Issues**
```bash
# Fix file permissions
chmod -R 755 uploads/
chown -R www-data:www-data /var/www/restaurant-pro/
```

### Logs

1. **Application Logs**
```bash
# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f backend
```

2. **System Logs**
```bash
# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -f
```

## Scaling

### Horizontal Scaling

1. **Load Balancer Setup**
2. **Database Clustering**
3. **Redis Clustering**
4. **CDN Integration**

### Vertical Scaling

1. **Increase server resources**
2. **Optimize database configuration**
3. **Tune application performance**