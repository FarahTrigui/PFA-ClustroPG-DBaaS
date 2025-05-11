variable "cluster_name" {
  description = "Nom du cluster PostgreSQL"
  type        = string
}

variable "instance_count" {
  description = "Nombre d'instances du cluster"
  type        = number
}

variable "storage_size" {
  description = "Taille du stockage"
  type        = string
}

variable "storage_class" {
  description = "Classe de stockage"
  type        = string
}
variable "s3_bucket" {
  description = "MinIO bucket name"
  type        = string
}

variable "s3_endpoint" {
  description = "MinIO endpoint URL"
  type        = string
}

variable "s3_path" {
  description = "Path prefix in the bucket"
  type        = string
}

variable "backup_schedule" {
  description = "Cron schedule for backups"
  type        = string
}
