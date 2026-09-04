# Complete Step-by-Step Guide: Hosting DAIH on Hostinger KVM VPS

**Target Architecture:** Multi-App Monorepo on a single Hostinger KVM Linux VPS  
**Domain Scope:** `*.daih.ng` / `.daih.ng` (Shared Parent Domain Cookie Scope)  
**Infrastructure Stack:** Ubuntu 24.04 LTS, Docker, PostgreSQL 16, Redis 7, MinIO, Node.js 20, pnpm 10, Coolify / Caddy Reverse Proxy

---

## Architecture Overview

```
                                  [ INTERNET ]
                                        │
                         [ Cloudflare DNS & Lagos Edge ]
                          (Proxied SSL / DDoS Shield)
                                        │
                                        ▼
                           Hostinger KVM VPS (France)
                    ┌───────────────────────────────────────┐
                    │    Reverse Proxy (Traefik / Caddy)    │
                    │        Ports 80 & 443 (HTTPS)         │
                    └───────────────────┬───────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
     daih.ng      admin.daih.ng    app.daih.ng    kiosk.daih.ng    api.daih.ng
   (apps/web)    (admin-portal)  (customer-pwa)  (reception-app)   (apps/api)
    Port 3000       Port 3003       Port 3001       Port 3002       Port 4000
                                                                        │
                                                     ┌──────────────────┴───────────────┐
                                                     ▼                                  ▼
                                            [ daih-postgres ]                   [ daih-redis ]
                                             (PostgreSQL 16)                       (Redis 7)
                                                Port 5432                          Port 6379
                                                     ▲                                  ▲
                                                     └──────────────────┬───────────────┘
                                                                        │
                                                             [ BullMQ Worker Daemon ]
                                                                (Background Jobs)
```

---

## Phase 1: Purchase & Provision Hostinger VPS

### Step 1.1: Select the Correct Plan

1. Go to [Hostinger VPS Hosting](https://www.hostinger.com/vps-hosting).
2. Select **KVM 2** (Minimum: 2 vCPU, 8 GB RAM, 100 GB NVMe) or **KVM 4** (Recommended: 4 vCPU, 16 GB RAM, 200 GB NVMe).
   > [!IMPORTANT]
   > Do **NOT** purchase Shared Web Hosting or Cloud Startup (hPanel). You must choose **KVM VPS**.

### Step 1.2: Server Setup Options

- **Server Location**: Select **France** (closest subsea fiber cable route to Lagos, Nigeria with ~80ms-100ms latency).
- **Operating System**:
  - **Option A (Recommended)**: Choose **Application / Panel** → **Ubuntu 24.04 with Coolify**.
  - **Option B**: Choose **Plain OS** → **Ubuntu 24.04 LTS 64-bit**.
- **Root Password**: Create a strong 24+ character password and save it securely.
- **SSH Keys (Optional but Recommended)**: Paste your public SSH key (`id_ed25519.pub`) to enable passwordless login.

---

## Phase 2: Domain & DNS Setup (Cloudflare)

To achieve **<10ms response times** for static assets in Nigeria, route your domain through Cloudflare:

1. In Cloudflare DNS (or your domain registrar), create the following `A` records pointing to your **Hostinger VPS Public IP**:

| Type | Name                      | Content (IPv4 Address) | Proxy Status           |
| :--- | :------------------------ | :--------------------- | :--------------------- |
| `A`  | `@` (`daih.ng`)           | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |
| `A`  | `www`                     | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |
| `A`  | `api` (`api.daih.ng`)     | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |
| `A`  | `admin` (`admin.daih.ng`) | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |
| `A`  | `app` (`app.daih.ng`)     | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |
| `A`  | `kiosk` (`kiosk.daih.ng`) | `YOUR_VPS_PUBLIC_IP`   | Proxied (Orange Cloud) |

2. In Cloudflare, set **SSL/TLS encryption mode** to **Full (strict)**.

---

## Phase 3: Initial Server Hardening & Swap

Connect to your VPS via SSH terminal:

```bash
ssh root@YOUR_VPS_PUBLIC_IP
```

### Step 3.1: Update System & Install Essentials

```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban htop unzip build-essential
```

### Step 3.2: Create a 4 GB Swap File (Critical for Next.js Builds)

Swap prevents Next.js compilation from running out of RAM during `pnpm build`:

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimize swappiness for database performance
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

### Step 3.3: Configure Firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify Dashboard (if using Coolify)
ufw enable -y
```

---

## Phase 4: Deploying with Coolify (Recommended Option)

If you chose the **Ubuntu with Coolify** template, access your dashboard at:

```text
http://YOUR_VPS_PUBLIC_IP:8000
```

_(Complete the initial admin account setup)._

### Step 4.1: Deploy PostgreSQL 16 & Redis 7

1. In Coolify, click **Projects** → **Default** → **Production** → **+ New Resource**.
2. Select **Databases** → **PostgreSQL**:
   - Name: `daih-postgres`
   - Version: `16`
   - Database Name: `daih_db`
   - User: `postgres`
   - Password: `[GENERATE_SECURE_PASSWORD]`
   - Click **Deploy**. Note the internal connection string:
     `postgresql://postgres:PASSWORD@daih-postgres:5432/daih_db`
3. Click **+ New Resource** → **Databases** → **Redis**:
   - Name: `daih-redis`
   - Version: `7`
   - Click **Deploy**. Internal URL: `redis://daih-redis:6379`

### Step 4.2: Connect Your GitHub Repository

1. In Coolify, go to **Keys & Tokens** → **Git Sources** → Add your GitHub App or Personal Access Token.
2. Grant read access to the `DAIH-main` repository.

### Step 4.3: Deploy `apps/api` (Core Backend)

1. In Coolify, click **+ New Resource** → **Application** → Select your GitHub repo.
2. Configure settings:
   - **Base Directory**: `apps/api`
   - **Build Pack**: Nixpacks or Dockerfile
   - **Install Command**: `pnpm install`
   - **Build Command**: `pnpm build`
   - **Start Command**: `node dist/server.js`
   - **Port**: `4000`
   - **Domains**: `https://api.daih.ng`
3. Add Environment Variables (see Section 6 below).
4. Click **Deploy**.

### Step 4.4: Deploy the Background Worker (`BullMQ`)

1. Click **+ New Resource** → **Application** → Select same repo.
2. Configure settings:
   - **Name**: `daih-worker`
   - **Base Directory**: `apps/api`
   - **Start Command**: `node dist/jobs/worker.js` (or `tsx src/jobs/worker.ts`)
   - **Port**: None (Internal background worker)
3. Share the same environment variables as `apps/api`.
4. Click **Deploy**.

### Step 4.5: Deploy the 4 Next.js Frontends

For each frontend application, add a new Application from the repository:

| App Name           | Base Directory       | Start Port | Domain                                   |
| :----------------- | :------------------- | :--------- | :--------------------------------------- |
| **daih-web**       | `apps/web`           | `3000`     | `https://daih.ng`, `https://www.daih.ng` |
| **daih-admin**     | `apps/admin-portal`  | `3003`     | `https://admin.daih.ng`                  |
| **daih-customer**  | `apps/customer-pwa`  | `3001`     | `https://app.daih.ng`                    |
| **daih-reception** | `apps/reception-app` | `3002`     | `https://kiosk.daih.ng`                  |

- Build Command for each: `pnpm build`
- Start Command: `pnpm start --port $PORT`

---

## Phase 5: Manual CLI Deployment with Docker Compose (Alternative Option)

If you chose a clean Ubuntu 24.04 server without Coolify:

### Step 5.1: Install Node.js, pnpm, and Docker

```bash
# Install Docker & Compose
curl -fsSL https://get.docker.com | sh
usermod -aG docker root

# Install Node 20 & pnpm 10
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pnpm@10.23.0 pm2
```

### Step 5.2: Clone Repository & Run Databases

```bash
cd /var/www
git clone <YOUR_GIT_REPO_URL> daih
cd /var/www/daih

# Start Postgres 16, Redis 7, MinIO
cd infra/docker
docker compose up -d
```

### Step 5.3: Run Database Migrations & Super Admin Seed

```bash
cd /var/www/daih
pnpm install
cd apps/api

# Push schema and seed
npx prisma db push --schema=src/db/prisma/schema.prisma
npx tsx src/scripts/seed-super-admin.ts
```

### Step 5.4: Build Monorepo & Start PM2

```bash
cd /var/www/daih
pnpm build

# Start API & Worker
cd apps/api
pm2 start dist/server.js --name "daih-api"
pm2 start "npx tsx src/jobs/worker.ts" --name "daih-worker"

# Start Frontends
cd ../web && pm2 start "pnpm start -- -p 3000" --name "daih-web"
cd ../customer-pwa && pm2 start "pnpm start -- -p 3001" --name "daih-pwa"
cd ../reception-app && pm2 start "pnpm start -- -p 3002" --name "daih-kiosk"
cd ../admin-portal && pm2 start "pnpm start -- -p 3003" --name "daih-admin"

# Save PM2 process list to persist across reboots
pm2 save
pm2 startup
```

### Step 5.5: Configure Caddy (Automatic Reverse Proxy & SSL)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

Create `/etc/caddy/Caddyfile`:

```caddy
daih.ng, www.daih.ng {
    reverse_proxy 127.0.0.1:3000
}

app.daih.ng {
    reverse_proxy 127.0.0.1:3001
}

kiosk.daih.ng {
    reverse_proxy 127.0.0.1:3002
}

admin.daih.ng {
    reverse_proxy 127.0.0.1:3003
}

api.daih.ng {
    reverse_proxy 127.0.0.1:4000
}
```

Restart Caddy:

```bash
systemctl restart caddy
```

---

## Phase 6: Environment Variables Reference

### Backend API (`apps/api/.env`)

```ini
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.daih.ng
APP_ENV=production

# Database & Redis
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/daih_db?schema=public"
REDIS_URL="redis://127.0.0.1:6379"

# JWT & Authentication (CRITICAL for cross-subdomain SSO)
JWT_SECRET=generate_at_least_32_random_characters_secret_here
JWT_REFRESH_SECRET=generate_second_32_characters_random_secret_here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
REFRESH_COOKIE_NAME=daih_refresh
REFRESH_COOKIE_DOMAIN=.daih.ng

# Super Admin Seed
SUPER_ADMIN_EMAIL=superadmin@daih.ng
SUPER_ADMIN_PASSWORD=SetAStrongPassword2026!
SUPER_ADMIN_FIRST_NAME=DAIH
SUPER_ADMIN_LAST_NAME=SuperAdmin
SUPER_ADMIN_PHONE=+2348000000001

# Email Providers
EMAIL_PROVIDER_PRIMARY=resend
RESEND_API_KEY=re_your_live_key
RESEND_FROM_EMAIL=no-reply@daih.ng

# Payments (Paystack)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public
PAYSTACK_WEBHOOK_SECRET=your_paystack_secret_hash
```

### Frontends (`.env.production` for all 4 apps)

```ini
NEXT_PUBLIC_API_URL=https://api.daih.ng/api/v1
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_WEB_URL=https://daih.ng
NEXT_PUBLIC_CUSTOMER_PORTAL_URL=https://app.daih.ng
NEXT_PUBLIC_CUSTOMER_PWA_URL=https://app.daih.ng
NEXT_PUBLIC_ADMIN_URL=https://admin.daih.ng
```

---

## Phase 7: Verification & Health Checks

Once deployed, run these commands to verify every layer:

1. **Check API Health & Database Connection:**

   ```bash
   curl -I https://api.daih.ng/health
   # Expected: HTTP/2 200 OK
   ```

2. **Check Cross-Domain Cookie Auth:**
   - Open `https://admin.daih.ng`.
   - Log in with your `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
   - Complete the MFA Authenticator QR scan.
   - Verify in browser DevTools → Application → Cookies that `daih_refresh` is set with domain `.daih.ng`.

3. **Check Background Worker Logs:**
   - Coolify: View logs in `daih-worker` panel.
   - PM2: `pm2 logs daih-worker`.

---

## Phase 8: Automated Daily Database Backups

Create a backup script at `/usr/local/bin/backup-daih-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/daih-postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

docker exec daih-postgres pg_dump -U postgres daih_db | gzip > "$BACKUP_DIR/daih_backup_$TIMESTAMP.sql.gz"

# Keep last 7 days only
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete
```

Make executable and add to cron:

```bash
chmod +x /usr/local/bin/backup-daih-db.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-daih-db.sh") | crontab -
```

_(Runs automatically every night at 2:00 AM)._
