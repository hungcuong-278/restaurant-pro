# 🚀 AWS Deployment Guide - Restaurant Pro

## 📊 Current Status (October 13, 2025)

### Servers Running:
- ✅ **Backend**: Running at http://localhost:5000
- ⏳ **Frontend**: Compiling (check PowerShell window)

---

## 🎯 Recommended AWS Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USERS / BROWSERS                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    ┌────▼─────┐         ┌─────▼────┐
    │CloudFront│         │   API    │
    │   CDN    │         │ Gateway  │
    └────┬─────┘         └─────┬────┘
         │                     │
    ┌────▼─────┐         ┌─────▼──────────┐
    │   S3     │         │   Elastic      │
    │ (React)  │         │  Beanstalk     │
    │ Static   │         │  (Node.js)     │
    └──────────┘         └─────┬──────────┘
                               │
                         ┌─────▼──────┐
                         │    RDS     │
                         │ PostgreSQL │
                         └────────────┘
```

---

## 🔧 Backend Deployment (Elastic Beanstalk)

### Prerequisites:
```bash
# Install AWS CLI
winget install Amazon.AWSCLI

# Install EB CLI
pip install awsebcli

# Configure AWS
aws configure
```

### Step 1: Prepare Backend
```bash
cd D:\First\backend

# Create .ebignore file
echo "node_modules/" > .ebignore
echo "database/dev.sqlite3" >> .ebignore
echo ".env.local" >> .ebignore

# Create package.json start script (if not exists)
# Ensure: "start": "node dist/index.js"
```

### Step 2: Initialize Elastic Beanstalk
```bash
# Initialize EB application
eb init -p node.js-18 restaurant-backend --region us-east-1

# Create environment
eb create restaurant-prod
```

### Step 3: Environment Variables
```bash
# Set environment variables
eb setenv NODE_ENV=production
eb setenv PORT=8080
eb setenv DATABASE_URL=<your-rds-connection-string>
eb setenv JWT_SECRET=<your-secret>
eb setenv STRIPE_SECRET_KEY=<your-stripe-key>
```

### Step 4: Deploy
```bash
# Deploy to EB
eb deploy

# Check status
eb status

# View logs
eb logs
```

---

## 🌐 Frontend Deployment (S3 + CloudFront)

### Step 1: Build Frontend
```bash
cd D:\First\frontend

# Update .env.production
echo "REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api" > .env.production

# Build
npm run build
```

### Step 2: Create S3 Bucket
```bash
# Create bucket
aws s3 mb s3://restaurant-pro-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://restaurant-pro-frontend --index-document index.html --error-document index.html

# Set public read policy
aws s3api put-bucket-policy --bucket restaurant-pro-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::restaurant-pro-frontend/*"
  }]
}'
```

### Step 3: Deploy to S3
```bash
# Upload build files
aws s3 sync build/ s3://restaurant-pro-frontend --delete

# Verify
echo "Frontend URL: http://restaurant-pro-frontend.s3-website-us-east-1.amazonaws.com"
```

### Step 4: Setup CloudFront (Optional but Recommended)
```bash
# Create CloudFront distribution via AWS Console
# Origin: your S3 bucket
# Enable HTTPS
# Custom domain (if you have)
```

---

## 🗄️ Database Migration (SQLite → RDS PostgreSQL)

### Step 1: Create RDS Instance
```bash
# Via AWS Console:
# 1. Go to RDS
# 2. Create Database → PostgreSQL
# 3. Choose Free Tier (for testing)
# 4. Set master username/password
# 5. Enable public access (for migration)
# 6. Create database
```

### Step 2: Migrate Data
```bash
cd D:\First\backend

# Install PostgreSQL adapter
npm install pg

# Update knexfile.ts for production
# Add PostgreSQL connection config

# Run migrations
npx knex migrate:latest --env production

# Run seeds (if needed)
npx knex seed:run --env production
```

### Sample knexfile.ts Production Config:
```typescript
production: {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  },
  migrations: {
    directory: './migrations',
    extension: 'ts'
  }
}
```

---

## 📝 Deployment Checklist

### Before Deployment:
- [ ] Backend builds successfully (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Database backup created
- [ ] .gitignore includes secrets
- [ ] CORS configured for production domain

### Backend EB:
- [ ] AWS CLI installed
- [ ] EB CLI installed
- [ ] AWS credentials configured
- [ ] `.ebignore` created
- [ ] Environment variables set
- [ ] Database connection tested

### Frontend S3:
- [ ] S3 bucket created
- [ ] Static hosting enabled
- [ ] Public read policy set
- [ ] Build uploaded
- [ ] CloudFront distribution created (optional)

### Database RDS:
- [ ] RDS instance created
- [ ] Security group configured
- [ ] Migrations run successfully
- [ ] Connection from EB tested

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Elastic Beanstalk | Free (pay for EC2) | $0.024/hour |
| EC2 t2.micro | 750 hours/month | $0.0116/hour |
| RDS db.t2.micro | 750 hours/month | $0.017/hour |
| S3 Storage | 5 GB | $0.023/GB/month |
| CloudFront | 50 GB transfer | $0.085/GB |

**Estimated Monthly Cost (after free tier)**: ~$20-30

---

## 🔒 Security Best Practices

1. **Environment Variables**: Use AWS Systems Manager Parameter Store
2. **Database**: Disable public access, use VPC
3. **API**: Enable rate limiting
4. **HTTPS**: Use CloudFront SSL certificate
5. **Secrets**: Never commit to Git
6. **IAM**: Use least privilege principle

---

## 🐛 Troubleshooting

### Backend not starting on EB:
```bash
# Check logs
eb logs

# Common issues:
# - Wrong Node.js version
# - Missing dependencies
# - Database connection failure
```

### Frontend blank page:
```bash
# Check browser console
# Common issues:
# - Wrong API URL in .env.production
# - CORS errors
# - Build errors
```

### Database connection failed:
```bash
# Check security group
# Check RDS endpoint
# Check credentials
# Test connection: psql -h <endpoint> -U <user> -d <database>
```

---

## 📞 Support

- AWS Documentation: https://docs.aws.amazon.com/
- Elastic Beanstalk: https://docs.aws.amazon.com/elasticbeanstalk/
- S3 Static Hosting: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

---

## 🎯 Quick Deploy Commands

```bash
# Backend
cd D:\First\backend
eb init -p node.js-18 restaurant-backend
eb create restaurant-prod
eb deploy

# Frontend
cd D:\First\frontend
npm run build
aws s3 sync build/ s3://restaurant-pro-frontend --delete

# Done! 🎉
```

---

**Need help with deployment? Let me know which part you want to start with!**
