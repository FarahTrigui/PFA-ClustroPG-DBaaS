terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.11.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config.yaml"
}
resource "kubernetes_manifest" "pg_cluster" {
  manifest = {
    apiVersion = "postgresql.cnpg.io/v1"
    kind       = "Cluster"
    metadata = {
      name      = var.cluster_name
      namespace = "default"
    }
    spec = {
      instances = var.instance_count
      storage = {
        size         = var.storage_size
        storageClass = var.storage_class
      }
  backup = {
    retentionPolicy = "7d"
    target = {
      s3 = {
        bucket         = var.s3_bucket
        endpointURL    = var.s3_endpoint
        region         = "us-east-1"
        credentials = {
  accessKeyId = {
    key  = "MINIO_ACCESS_KEY"  # Must match the key in your secret
    name = "minio-creds"
  }
  secretAccessKey = {
    key  = "MINIO_SECRET_KEY"  # Must match the key in your secret
    name = "minio-creds"
  }
}
        path           = var.s3_path
        insecure       = true  # Use true if MinIO has no HTTPS
      }
    }
  }

  backupSchedules = [
    {
      name                 = "daily-s3-backup"
      schedule             = var.backup_schedule
      backupOwnerReference = "self"
    }
  ]

    }
  }
}

