# Deployment Guide

## Overview

This guide covers deploying NutriFuel to various hosting platforms. NutriFuel is built with Next.js 16, which can be deployed to multiple platforms with minimal configuration.

---

## Prerequisites

Before deploying, ensure you have:
- [ ] OpenAI API key
- [ ] Git repository set up
- [ ] Environment variables configured
- [ ] Production build tested locally

---

## Platform-Specific Guides

### 1. Vercel (Recommended)

Vercel is the recommended platform for Next.js applications, offering seamless deployment and optimal performance.

#### Steps:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```
   
   Or **Deploy via GitHub Integration**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Configure Environment Variables**
   
   In your Vercel project settings:
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_DEFAULT_API_KEY` = `your_openai_api_key`

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### Features:
- ✅ Automatic HTTPS
- ✅ Continuous deployment from Git
- ✅ Preview deployments for PRs
- ✅ Analytics and performance monitoring
- ✅ Edge network distribution
- ✅ Serverless functions support

---

### 2. Netlify

#### Steps:

1. **Create `netlify.toml`**
   ```toml
   [build]
     command = "pnpm build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy via Netlify Dashboard**
   - Connect your Git repository
   - Set build command: `pnpm build`
   - Set publish directory: `.next`
   - Add environment variables

3. **Or Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

---

### 3. Docker

#### Create `Dockerfile`

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  nutrifuel:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_DEFAULT_API_KEY=${NEXT_PUBLIC_DEFAULT_API_KEY}
    restart: unless-stopped
```

#### Build and Run

```bash
# Build
docker build -t nutrifuel .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_DEFAULT_API_KEY=your_key \
  nutrifuel

# Or with docker-compose
docker-compose up -d
```

---

### 4. AWS (Amazon Web Services)

#### Option A: AWS Amplify

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   ```

4. **Publish**
   ```bash
   amplify publish
   ```

#### Option B: AWS EC2 + PM2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Configure security group (ports 22, 80, 443, 3000)

2. **Install Dependencies**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install pnpm
   sudo npm install -g pnpm pm2
   ```

3. **Clone and Build**
   ```bash
   git clone your-repo-url
   cd nutrifuel
   pnpm install
   pnpm build
   ```

4. **Set up PM2**
   ```bash
   # Create ecosystem file
   pm2 ecosystem
   
   # Edit ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'nutrifuel',
       script: 'pnpm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         NEXT_PUBLIC_DEFAULT_API_KEY: 'your_key'
       }
     }]
   }
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx (Optional)**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

### 5. DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select "Web Service"
   - Choose "Next.js" detected

2. **Configure**
   - Build Command: `pnpm build`
   - Run Command: `pnpm start`
   - Add environment variables

3. **Deploy**
   - Click "Create Resources"

---

### 6. Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Init**
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_DEFAULT_API_KEY=your_key
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

## Environment Variables

All platforms require these environment variables:

```env
# Required
NEXT_PUBLIC_DEFAULT_API_KEY=sk-proj-xxx...

# Optional (if implementing auth)
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com

# Optional (if using database)
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```

---

## Pre-Deployment Checklist

- [ ] Run `pnpm build` locally to check for errors
- [ ] Test production build locally: `pnpm start`
- [ ] Verify all API routes work
- [ ] Check image optimization settings
- [ ] Review environment variables
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure analytics (Vercel Analytics, Google Analytics)
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL/HTTPS
- [ ] Test mobile responsiveness
- [ ] Check SEO meta tags
- [ ] Review security headers
- [ ] Set up monitoring/logging

---

## Post-Deployment

### 1. Monitoring

Set up monitoring tools:
- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM

### 2. Performance

Optimize for production:
- Enable image optimization
- Configure caching headers
- Use CDN for static assets
- Implement code splitting
- Monitor Core Web Vitals

### 3. Security

Security best practices:
- Rotate API keys regularly
- Implement rate limiting
- Add security headers
- Use HTTPS only
- Enable CORS properly
- Implement CSP headers

---

## Continuous Deployment

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_DEFAULT_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Rollback Strategy

If issues arise after deployment:

1. **Vercel**: Use dashboard to revert to previous deployment
2. **PM2**: `pm2 reload nutrifuel --update-env`
3. **Docker**: Revert to previous image tag
4. **Git**: Revert commit and redeploy

---

## Scaling Considerations

As your app grows:
- [ ] Implement database for user data (PostgreSQL, MongoDB)
- [ ] Add Redis for caching
- [ ] Use CDN for static assets
- [ ] Implement load balancing
- [ ] Add monitoring and alerts
- [ ] Set up backup strategy
- [ ] Implement rate limiting per user

---

## Cost Estimation

### Free Tier Options:
- **Vercel**: Free for hobby projects
- **Netlify**: 100GB bandwidth free
- **Railway**: $5/month credit free
- **DigitalOcean**: Starting at $6/month

### Estimated Monthly Costs:
- **Vercel Pro**: $20/month
- **AWS (t3.small EC2)**: ~$15-20/month
- **DigitalOcean**: $6-12/month
- **Railway**: ~$5-10/month
- **OpenAI API**: Variable (depends on usage)

---

## Support

For deployment issues:
- Check platform documentation
- Review build logs
- Test locally first
- Contact platform support
- Open GitHub issue
