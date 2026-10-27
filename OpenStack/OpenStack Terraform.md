Thème : [[OpenStack]]

# OpenStack Terraform

1. Déclarer le provider, qui lit `clouds.yaml` : aucun secret dans le code.
   ```hcl
   terraform {
     required_version = ">= 1.5"

     required_providers {
       openstack = {
         source  = "terraform-provider-openstack/openstack"
         version = "~> 3.0"
       }
     }
   }

   provider "openstack" {
     cloud = var.cloud_name
   }
   ```
2. Clé SSH et groupe de sécurité :
   ```hcl
   resource "openstack_compute_keypair_v2" "this" {
     name       = "${var.name}-key"
     public_key = file(pathexpand(var.public_key_path))
   }

   resource "openstack_networking_secgroup_v2" "this" {
     name = "${var.name}-sg"
   }

   resource "openstack_networking_secgroup_rule_v2" "ssh" {
     direction         = "ingress"
     ethertype         = "IPv4"
     protocol          = "tcp"
     port_range_min    = 22
     port_range_max    = 22
     remote_ip_prefix  = var.allowed_ssh_cidr
     security_group_id = openstack_networking_secgroup_v2.this.id
   }
   ```
3. Instance :
   ```hcl
   resource "openstack_compute_instance_v2" "this" {
     name            = var.name
     image_name      = var.image_name
     flavor_name     = var.flavor_name
     key_pair        = openstack_compute_keypair_v2.this.name
     security_groups = [openstack_networking_secgroup_v2.this.name]

     network {
       name = var.network_name
     }
   }
   ```
4. IP flottante, associée par le port réseau (provider v3) :
   ```hcl
   resource "openstack_networking_floatingip_v2" "this" {
     pool = var.floating_ip_pool
   }

   data "openstack_networking_network_v2" "private" {
     name = var.network_name
   }

   data "openstack_networking_port_v2" "this" {
     device_id  = openstack_compute_instance_v2.this.id
     network_id = data.openstack_networking_network_v2.private.id
   }

   resource "openstack_networking_floatingip_associate_v2" "this" {
     floating_ip = openstack_networking_floatingip_v2.this.address
     port_id     = data.openstack_networking_port_v2.this.id
   }

   output "public_ip" {
     value = openstack_networking_floatingip_v2.this.address
   }
   ```
5. Lancer :
   ```bash
   export OS_CLOUD=<cloud>
   terraform init
   terraform plan -out=tfplan.bin
   terraform apply tfplan.bin
   ```
6. Attendre SSH : l'instance est `ACTIVE` bien avant que `sshd` réponde.
   ```bash
   until ssh -o ConnectTimeout=5 -o BatchMode=yes <user>@"$(terraform output -raw public_ip)" true; do sleep 5; done
   ```
