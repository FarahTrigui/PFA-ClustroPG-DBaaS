# 🚀 ClustroPG: A PostgreSQL DBaaS on Kubernetes

ClustroPG is a fully managed PostgreSQL-as-a-Service platform deployed on Kubernetes. It abstracts the complexity of provisioning, scaling, backing up, and monitoring PostgreSQL clusters through a user-friendly interface and a Terraform-powered backend.

This project was developed as part of our final-year engineering project at INSAT to bridge the gap between DevOps, Database Administration, and modern cloud-native practices.

<img src="https://github.com/FarahTrigui/PFA-ClustroPG-DBaaS/blob/main/Capture%20d'%C3%A9cran%202025-07-24%20195912.png" alt="ClustroPG Dashboard" width="900"/>

---

## 🧠 Why ClustroPG?

Managing PostgreSQL on Kubernetes typically requires expertise in Kubernetes objects (StatefulSets, PVCs), operators, Helm charts, YAML configurations, backup tools, monitoring setups, and more.

**ClustroPG solves this problem by offering:**
- 🖱️ A simple web UI that lets users provision and manage databases without writing YAML or using `kubectl`.
- 🔧 A backend powered by **Terraform** to orchestrate database clusters declaratively.
- 🔄 Seamless automation of cluster creation, backup configuration, and monitoring.
- 📦 Logical and WAL backups to MinIO for reliable disaster recovery.
- 📊 Real-time observability via **Prometheus** and **Grafana** dashboards.

---

## ✨ Key Features

- 🌐 Web interface to request PostgreSQL clusters in just a few clicks.
- 🔁 Support for both logical and continuous (WAL) backups.
- 📈 Integrated monitoring with Prometheus and Grafana.
- ⚙️ Infrastructure-as-Code backend using Terraform.
- ⛑️ Operator-based orchestration (CloudNativePG).
- 🔐 Kubernetes-native security and access control.

---

## 🧱 Architecture

The platform is structured in 3 main layers:

1. **Abstraction Layer**
   - **Frontend:** A simple UI where users specify high-level parameters like:
     - Client type (Startup, SME, Enterprise)
     - Expected database size
     - Backup preferences (yes/no, frequency)
   - **Backend (Flask):** Interprets these parameters and generates a corresponding Terraform plan that provisions the right PostgreSQL cluster.

2. **Orchestration Layer**
   - Uses **CloudNativePG**, a production-grade Kubernetes operator, to manage the lifecycle of PostgreSQL clusters (HA, replication, failover, etc.)

3. **Infrastructure Layer**
   - Provisioning and resource management on Kubernetes using Terraform.
   - Persistent storage setup, MinIO for backup, Prometheus stack for monitoring.

### 📸 Architecture Diagram

<img src="https://raw.githubusercontent.com/FarahTrigui/PFA-ClustroPG-DBaaS/main/our%20architecture.png" alt="ClustroPG Architecture" width="700"/>

---

## 🛠️ Technologies Used

| Layer                | Tools/Technologies                             |
|----------------------|-------------------------------------------------|
| Frontend             | HTML, JavaScript, Flask templates              |
| Backend              | Flask, Python, Terraform SDK                   |
| Orchestration        | Kubernetes, CloudNativePG                      |
| Storage/Backup       | MinIO, WAL-E, pg_dump, pg_restore              |
| Monitoring           | Prometheus, Grafana                            |
| Infrastructure as Code | Terraform, Helm                             |

---

## ⚡ Power of Abstraction in ClustroPG

The **core innovation** of ClustroPG lies in its abstraction logic:

Instead of dealing with complex Kubernetes YAMLs or operator specs, users only answer **a few simple questions** like:
- How many databases?
- What is your expected load (Small / Medium / Big)?
- Do you need backups? How frequent?

Based on that, the backend:
- Chooses optimal resources (CPU, RAM, PVC size)
- Writes a custom Terraform file
- Applies it to create a fully managed PostgreSQL cluster
- Connects it to monitoring and backup tools
- Returns access info and monitoring links to the user

This approach removes all the friction for DevOps teams, startups, or data engineers who want databases **on demand**.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/FarahTrigui/PFA-ClustroPG-DBaaS.git
cd PFA-ClustroPG-DBaaS
```
### 2. Launch the UI
### 3. Backend Logic
-The backend automatically:
-Receives form input
-Writes a Terraform configuration
-Applies it to Kubernetes via subprocess or Terraform SDK
Make sure you have:
-Terraform installed
-kubeconfig pointing to a valid Kubernetes cluster
-CloudNativePG installed
## Project Structure
📁 PFA-ClustroPG-DBaaS/
│
├── PFA-ClustroPG/              # Flask templates and UI logic
├── api/                        # Python logic to handle Terraform generation
├── terraform/                  # Terraform modules and files
└── our architecture.png        # Architecture image
## Authors
Farah Trigui
Olfa Medimegh
