variable "cluster_name" {
  type = string
}

variable "instance_count" {
  type = number
}

variable "storage_size" {
  type = string
}

variable "storage_class" {
  type = string
}

variable "s3_bucket" {
  description = "The name of the S3 bucket for backups"
  type        = string
}

variable "s3_path" {
  description = "The path within the S3 bucket for backups"
  type        = string
}

variable "s3_endpoint" {
  description = "The endpoint URL for S3 storage"
  type        = string
}

variable "backup_enabled" {
  description = "Enable or disable backups"
  type        = bool
  default     = false
}

variable "backup_frequency" {
  description = "Frequency of backups"
  type        = string
  default     = ""
}

variable "backup_schedule" {
  description = "Cron schedule for backups"
  type        = string
}
variable "enable_monitoring" {
  description = "Enable PodMonitor for Prometheus monitoring"
  type        = bool
  default     = true
}

variable "monitoring_namespace" {
  description = "Namespace where monitoring is installed"
  type        = string
  default     = "monitoring"
}
