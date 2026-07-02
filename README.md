# 🚀 NearKart — Quick Commerce Platform Connecting Local Vendors with Customers

> A production-grade, cloud-native quick commerce platform built end-to-end — from application code to infrastructure automation — that helps local shopkeepers go digital and lets customers order from nearby stores in minutes.

<p align="left">
  <img src="https://img.shields.io/badge/Stack-MERN-2ea44f" />
  <img src="https://img.shields.io/badge/Containerized-Docker-2496ED" />
  <img src="https://img.shields.io/badge/Orchestrated-Kubernetes-326CE5" />
  <img src="https://img.shields.io/badge/Cloud-AWS-FF9900" />
  <img src="https://img.shields.io/badge/CI%2FCD-Jenkins-D24939" />
  <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC" />
  <img src="https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-E6522C" />
</p>


---

## 📌 Why I Built This

Most e-commerce tutorials stop at "add to cart and checkout." NearKart goes further: it's built like a real product would be at a company — with authentication, real payments, an admin dashboard for vendors, and a full DevOps pipeline that takes code from a `git push` to a monitored, auto-scaling deployment on AWS.

The goal was to demonstrate **two things interviewers actually care about**:
1. I can build a complete, working full-stack application (not just a UI mockup).
2. I can own that application in production — containerize it, deploy it, automate its release pipeline, and observe it once it's live.

---

## ✨ Key Features

### 🛒 Customer Experience
- JWT-based secure authentication and session management
- Product discovery with search and category filtering
- Persistent shopping cart and order flow
- Real UPI payments via Razorpay (not a mock/sandbox-only integration)
- Fully responsive UI across mobile and desktop

### 🛠️ Vendor / Admin Dashboard
- Role-based access control (customer vs. admin)
- Product & inventory management (CRUD)
- Live order monitoring
- User administration

### ☁️ DevOps & Cloud Infrastructure
- Multi-stage Dockerized services (frontend, backend, DB)
- Jenkins CI/CD pipeline — automated build, test, and deploy on every push
- Kubernetes deployment with declarative manifests
- AWS infrastructure provisioned entirely via Terraform (IaC)
- Prometheus metrics collection + Grafana dashboards for real-time observability

---

## 🏗️ Architecture

**Application flow:**

```
React.js (Frontend)
        │
        ▼
Node.js + Express (REST API)
        │
        ▼
MongoDB (Database)
        │
        ▼
Razorpay (Payments)
```

**Deployment pipeline:**

```
GitHub → Jenkins CI/CD → Docker Images → Kubernetes Cluster → AWS Infrastructure → Prometheus → Grafana
```

> 💡 *Every code change is built into a Docker image, pushed to a registry, deployed to Kubernetes, and immediately observable via Grafana dashboards fed by Prometheus metrics — a real continuous delivery loop, not a one-time manual deploy.*

---

## 🛠️ Tech Stack

| Layer                   | Technology                       |
| ------------------------ | --------------------------------- |
| Frontend                | React.js, JavaScript, HTML, CSS  |
| Backend                 | Node.js, Express.js              |
| Database                | MongoDB                          |
| Authentication          | JWT                               |
| Payments                | Razorpay (UPI)                   |
| Containerization        | Docker                            |
| CI/CD                   | Jenkins                           |
| Orchestration           | Kubernetes                        |
| Cloud Provider           | AWS                               |
| Infrastructure as Code  | Terraform                         |
| Monitoring & Alerting   | Prometheus, Grafana              |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Razorpay API keys

### Local Setup
```bash
# Clone the repository
git clone https://github.com/<your-username>/nearkart.git
cd nearkart

# Install dependencies
cd client && npm install
cd ../server && npm install

# Set up environment variables
cp .env.example .env   # add MongoDB URI, JWT secret, Razorpay keys

# Run with Docker Compose
docker-compose up --build
```

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

### Deploying to Kubernetes
```bash
kubectl apply -f k8s/
```

### Provisioning AWS Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## 🧩 Engineering Challenges & Solutions

> *(Fill this in with 2–3 real examples — this is the section interviewers read most closely.)*

| Challenge | How I solved it |
|---|---|
| e.g. Securing payment callbacks from Razorpay | e.g. Verified webhook signatures server-side and used idempotency keys to prevent duplicate order confirmation |
| e.g. Zero-downtime deployments | e.g. Configured rolling updates in Kubernetes with readiness/liveness probes |
| e.g. Environment parity between local and prod | e.g. Used Terraform + Docker Compose to keep infra config identical across environments |

---

## 📈 What This Project Demonstrates

- **Full-Stack Development** — REST API design, auth, state management, payment integration
- **DevOps Proficiency** — Docker, Kubernetes, Jenkins CI/CD pipelines end-to-end
- **Cloud & Infrastructure** — AWS provisioning via Terraform (Infrastructure as Code)
- **Observability** — Prometheus + Grafana for metrics and monitoring
- **Production Mindset** — Role-based access, secure payments, scalable deployment architecture

---

## 🔮 Roadmap

- [ ] Real-time order tracking (WebSockets)
- [ ] Recommendation engine
- [ ] Vendor analytics dashboard
- [ ] Migration to microservices architecture
- [ ] Centralized logging & alerting (ELK / Loki)
- [ ] AI-based product recommendations

---

## 👨‍💻 Author

**Aviral Chaurasia**
Full-Stack Developer | DevOps Enthusiast

Passionate about building scalable applications and automating the infrastructure that runs them.

[GitHub](#) · [LinkedIn](#) · [Portfolio](#) · [Email](#)

---

<p align="center"><i>⭐ If you found this project interesting, a star on the repo is appreciated!</i></p>
