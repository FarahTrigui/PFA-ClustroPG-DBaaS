# ClustroPG - Managed PostgreSQL Service on Kubernetes

ClustroPG is a cloud-native platform for provisioning, managing, and monitoring PostgreSQL clusters on Kubernetes. It simplifies the database lifecycle by offering an intuitive web interface, infrastructure automation via Terraform, and seamless integration with Kubernetes-native operators like CloudNativePG.

---

## 📌 Features

- 🐘 Fully managed PostgreSQL clusters
- 🚀 One-click provisioning via web UI
- 📦 Automated storage sizing
- 🔄 Built-in backup and recovery (MinIO + logical backups)
- 📊 Monitoring with Prometheus & Grafana
- 🛠️ Infrastructure as Code using Terraform
- 🔒 Role-based access & multi-client management (planned)

---

## 🧱 Architecture

![ClustroPG Architecture](https://raw.githubusercontent.com/FarahTrigui/PFA-ClustroPG-DBaaS/main/our%20architecture.png)


---

## 🛠️ Technologies Used

| Layer                 | Tools & Frameworks |
|----------------------|--------------------|
| Frontend (UI)        | Flask, HTML/CSS    |
| Backend API          | Flask, Python      |
| Infrastructure Logic | Terraform, Helm    |
| Orchestration Layer  | CloudNativePG      |
| Monitoring           | Prometheus, Grafana|
| Backup               | MinIO, pg_dump     |
| Platform             | Kubernetes         |

---

## 🚀 Getting Started

### Prerequisites

- Kubernetes Cluster (Minikube, k3d, or production-ready)
- `kubectl`, `helm`, `terraform`, `docker`
- CloudNativePG Operator installed (cnpg in our case)
- MinIO instance running for backups
- Python 3.9+ with Flask

### Backend Setup

```bash
cd backend/
python -m venv venv
source venv/bin/activate
python app.py
