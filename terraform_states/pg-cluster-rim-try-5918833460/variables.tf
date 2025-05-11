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

variable "s3_access_key_id" {
  description = "S3 access key ID"
  type        = string
}

variable "s3_secret_access_key" {
  description = "S3 secret access key"
  type        = string
}

variable "s3_endpoint" {
  description = "S3 endpoint"
  type        = string
}

variable "backup_schedule" {
  description = "The cron schedule for backups"
  type        = string
  default     = "0 3 * * *"
}

