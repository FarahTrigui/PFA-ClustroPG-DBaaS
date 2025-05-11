# ClustroPG

**ClustroPG** is an infrastructure abstraction system for managing **PostgreSQL clusters on Kubernetes** using the [CloudNativePG operator](https://cloudnative-pg.io/), with **backup integration via MinIO**, and **automated provisioning using Terraform**.  

The project abstracts away the operational complexity of Kubernetes and offers a programmable interface to:

- Deploy production-grade PostgreSQL clusters.
- Configure scalable backup plans.
- Integrate with object storage (MinIO).
- Manage infrastructure-as-code without exposing raw YAML or CLI tools.
- Optionally interact via a lightweight web UI (Flask-based).

---

## 🔧 Core Components

| Layer            | Technology         | Role                                               |
|------------------|--------------------|----------------------------------------------------|
| Infrastructure   | Kubernetes (kubeadm or cloud) | Runtime for PostgreSQL clusters           |
| Abstraction      | Terraform + Flask  | Declarative + programmatic PostgreSQL lifecycle    |
| Operator         | CloudNativePG (CNPG) | CRD-based PostgreSQL management in K8s           |
| Storage          | MinIO (S3 API)     | Backup destination (WAL & base backups)            |
| State Management | tfstate per cluster| Cluster config stored in S3/MinIO after apply      |
| UI               | React/JS (via Flask)| Enhanced user experience, no YAML or kubectl needed|

---

## 📁 Project Structure
Abstraction/
├── api/ # Flask backend + cluster creation logic
│ ├── app.py # Main Flask app
├── terraform/ # Terraform base module for CNPG clusters
├── PFA-/ # Per-cluster working directories with tfstate
├── .gitignore
├── README.md

---

## How It Works

1. The user fills out a form (or hits an API endpoint).
2. The Flask app copies a Terraform module and injects variables (name, backup config, etc.).
3. `terraform init && apply` is run programmatically.
4. On success, the generated `terraform.tfstate` is uploaded to MinIO under: s3://clientbackups/<client_name>/<cluster_name>/terraform.tfstate
5. CNPG uses its own backup strategy to store database data into MinIO.

---

## ✅ Features

- 🔁 **Full PostgreSQL lifecycle automation**
- ☁️ **S3-compatible backup configuration**
- 🔧 **Scalability via Terraform variables**
- 🔍 **Cluster state tracking (tfstate, CNPG status)**
- 🧱 **Composable Terraform structure for modularity**
- 🖥️ **frontend for ease-of-use**

---

## 🧪 Quick Start

```bash
git clone https://github.com/FarahTrigui/PFA-ClustroPG-DBaaS.git
cd PFA-ClustroPG-DBaaS
pip install -r requirements.txt

export MINIO_ACCESS_KEY=your-access-key
export MINIO_SECRET_KEY=your-secret-key

python api/app.py

