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
      backup = var.backup_enabled ? {
        barmanObjectStore = {
          destinationPath = "s3://${var.s3_bucket}${var.s3_path}"
          endpointURL     = var.s3_endpoint
          s3Credentials = {
            accessKeyId = {
              key  = "MINIO_ACCESS_KEY"
              name = "minio-creds"
            }
            secretAccessKey = {
              key  = "MINIO_SECRET_KEY"
              name = "minio-creds"
            }
          }
          wal = {
            compression = "gzip"
            maxParallel = 4
          }
        }
        target = "primary"
      } : null
    }
  }
}
