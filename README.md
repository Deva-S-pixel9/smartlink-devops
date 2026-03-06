# 🔗 SmartLink — Intelligent URL Platform

> A production-grade DevOps Capstone Project demonstrating a complete 
> end-to-end CI/CD pipeline with real-time monitoring and automation.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-red)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-orange)
![Grafana](https://img.shields.io/badge/Grafana-Dashboard-yellow)

---

## 🌐 Live Application
**URL:** http://3.239.36.58:3000

---

## 📌 Project Overview

SmartLink is an Intelligent URL Platform built with Node.js that provides:

- 🔗 **URL Shortening** — Convert long URLs into short shareable links
- 📱 **QR Code Generation** — Auto-generate QR codes for every short link
- ⏰ **Expiring Links** — Set links to expire after 24 hours or 7 days
- 📊 **Real-time Analytics** — Monitor clicks, redirects via Grafana dashboard
- 🔒 **Prometheus Metrics** — Custom /metrics endpoint for business-level observability

---

## 🏗️ Architecture
```
╔══════════════════════════════════════════════════════════════╗
║                    SmartLink DevOps Flow                     ║
╚══════════════════════════════════════════════════════════════╝

  👨‍💻 Developer
       │
       │  git push
       ▼
  ┌─────────────┐
  │   GitHub    │  ──── webhook trigger ────►  ┌─────────────────────────┐
  │  Repository │                              │     Jenkins Server       │
  └─────────────┘                              │       (AWS EC2)          │
                                               │                          │
                                               │  ┌─────────────────────┐│
                                               │  │   Pipeline Stages   ││
                                               │  │                     ││
                                               │  │  ① Checkout Code    ││
                                               │  │  ② Install Deps     ││
                                               │  │  ③ Build Image      ││
                                               │  │  ④ Push to Hub      ││
                                               │  │  ⑤ Deploy to EC2    ││
                                               │  └────────┬────────────┘│
                                               └───────────┼─────────────┘
                                                           │
                         ┌─────────────┐                  │ docker push
                         │  Docker Hub │ ◄────────────────┘
                         │  Registry   │
                         └──────┬──────┘
                                │ docker pull
                                ▼
                    ┌───────────────────────┐
                    │    App Server (EC2)    │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │   SmartLink     │  │
                    │  │   Container     │  │
                    │  │   port :3000    │  │
                    │  └────────┬────────┘  │
                    │           │           │
                    │      /metrics         │
                    └───────────┼───────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌─────────────┐  ┌───────────┐  ┌────────────┐
        │    Node     │  │Prometheus │  │  Grafana   │
        │  Exporter   │  │           │  │ Dashboard  │
        │ :9100       │  │  :9090    │  │   :3000    │
        └──────┬──────┘  └─────┬─────┘  └─────┬──────┘
               │               │               │
               └───────────────┴───────────────┘
                         Monitoring Stack
```

**Flow Summary:**
```
Push Code → GitHub → Jenkins → Build → DockerHub → Deploy → Monitor
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Application** | Node.js + Express | Web framework |
| **Database** | SQLite | Lightweight URL storage |
| **Containerization** | Docker + Docker Hub | Consistent deployment |
| **CI/CD** | Jenkins | Automated pipeline |
| **Cloud** | AWS EC2 (Ubuntu 24.04) | Cloud hosting |
| **Monitoring** | Prometheus + Grafana | Metrics + Dashboard |
| **System Metrics** | Node Exporter | CPU, RAM, Disk monitoring |
| **Automation** | Bash + Cron | Scheduled tasks |
| **Source Control** | Git + GitHub | Version control + webhook |

---

## ✨ Unique Features

### 1. QR Code Auto-Generation
Every short URL automatically generates a downloadable QR code
using the `qrcode` npm package — no extra steps needed.

### 2. Configurable Link Expiry
Users can set links to expire after:
- 24 Hours
- 7 Days  
- Never (permanent)

Expired links are automatically cleaned up every 60 seconds.

### 3. Application-Level Observability
Custom Prometheus metrics exposed at `/metrics`:
```
smartlink_urls_created_total    — Total short URLs created
smartlink_redirects_total       — Total URL redirections  
smartlink_urls_expired_total    — Total expired links cleaned
```

This enables **business-level monitoring** in Grafana, not just system metrics.

---

## 🚀 Quick Start

### Run Locally
```bash
git clone https://github.com/Deva-S-pixel9/smartlink-devops.git
cd smartlink-devops
npm install
node app.js
# Visit http://localhost:3000
```

### Run with Docker
```bash
docker build -t smartlink .
docker run -d -p 3000:3000 smartlink
# Visit http://localhost:3000
```

### 🌐 Live Deployment
**→ http://3.239.36.58:3000**

---

## ⚙️ CI/CD Pipeline

### Pipeline Flow
**GitHub Push → Jenkins Webhook → 5-Stage Pipeline → Live Deployment**

### Pipeline Stages

| Stage | Description | Tool |
|-------|-------------|------|
| **Checkout Code** | Pull latest code from GitHub | Git |
| **Install Dependencies** | Download Node.js packages | npm |
| **Build Docker Image** | Create container image with build tag | Docker |
| **Push to Docker Hub** | Upload image to registry | Docker Hub |
| **Deploy to App Server** | SSH deploy, restart container | SSH + Docker |

### Auto-Trigger
Every `git push` to `main` branch automatically triggers the pipeline via **GitHub webhook** — zero manual intervention required.

---

## 📊 Monitoring Setup

### Prometheus Targets
| Target | Endpoint | Status | Metrics |
|--------|----------|--------|---------|
| jenkins-server | 34.205.43.43:9100 | ✅ UP | CPU, RAM, Disk |
| app-server-system | 3.239.36.58:9100 | ✅ UP | CPU, RAM, Disk |
| smartlink-app | 3.239.36.58:3000/metrics | ✅ UP | URLs, Redirects, Expired |

### Grafana Dashboards
1. **Node Exporter Full** (ID: 1860) — System metrics (CPU, RAM, Disk, Network)
2. **SmartLink Analytics** — Custom business metrics dashboard

### Custom Metrics
```
smartlink_urls_created_total    → Total short URLs created
smartlink_redirects_total       → Total URL redirections
smartlink_urls_expired_total    → Total expired links cleaned
```

### Access Monitoring
| Service | URL |
|---------|-----|
| Prometheus | http://34.205.43.43:9090 |
| Prometheus Targets | http://34.205.43.43:9090/targets |
| Grafana | http://34.205.43.43:3000 |

---

## 🤖 Automation Scripts

### backup.sh (App-Server)
- **Schedule:** Every day at midnight (`0 0 * * *`)
- **Action:** Copies SQLite database from Docker container to backup folder
- **Retention:** Automatically deletes backups older than 7 days

### cleanup.sh (Jenkins-Server)
- **Schedule:** Every Sunday at 2am (`0 2 * * 0`)
- **Action:** Removes unused Docker images and stopped containers
- **Purpose:** Keeps Jenkins server disk space healthy

---

## 📁 Project Structure
```
smartlink-devops/
├── app.js              # Main Node.js application
├── Dockerfile          # Container configuration
├── Jenkinsfile         # CI/CD pipeline definition
├── setup.sh            # Automated server setup script
├── backup.sh           # Database backup automation
├── cleanup.sh          # Docker cleanup automation
├── package.json        # Node.js dependencies
├── package-lock.json   # Exact dependency versions (auto-generated)
├── .dockerignore       # Docker ignore rules
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

---

## 🖥️ Infrastructure

| Server | Type | Purpose | IP |
|--------|------|---------|-----|
| smartlink-Jenkins-server | AWS EC2 t3.small | Jenkins + Prometheus + Grafana | 34.205.43.43 |
| smartlink-app-server | AWS EC2 t3.micro | SmartLink Docker Container | 3.239.36.58 |

---

## 👨‍💻 Author
**Deva S**
EMC Institute — DevOps Capstone Project 2026
GitHub: [@Deva-S-pixel9](https://github.com/Deva-S-pixel9)
🔗 Repository: [smartlink-devops](https://github.com/Deva-S-pixel9/smartlink-devops)

---
<!-- Demo 2: Live CI/CD Pipeline Trigger -->