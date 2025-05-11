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
