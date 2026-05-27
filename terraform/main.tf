provider "aws" {
  region = var.aws_region
}

# 1. Security Group to allow necessary web and SSH traffic
resource "aws_security_group" "nearkart_sg" {
  name        = "nearkart-security-group"
  description = "Allow inbound traffic for NearKart app and Jenkins"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (Standard Web)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # NearKart Backend
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NearKart Frontend
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic (so the server can download Docker/Node etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Find the latest Ubuntu 24.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Official Canonical account

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# 3. Create a Key Pair automatically
resource "tls_private_key" "nearkart_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "nearkart_key_pair" {
  key_name   = "nearkart-key-${random_id.key_id.hex}"
  public_key = tls_private_key.nearkart_key.public_key_openssh
}

resource "random_id" "key_id" {
  byte_length = 4
}

resource "local_file" "private_key" {
  content         = tls_private_key.nearkart_key.private_key_pem
  filename        = "${path.module}/nearkart-key.pem"
  file_permission = "0400"
}

# 4. Create the EC2 Server
resource "aws_instance" "nearkart_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro" # Free tier eligible
  key_name      = aws_key_pair.nearkart_key_pair.key_name

  security_groups = [aws_security_group.nearkart_sg.name]

  # This script runs automatically when the server boots for the very first time
  user_data = <<-EOF
              #!/bin/bash
              # Update packages
              apt-get update -y
              
              # Install Docker
              apt-get install -y docker.io docker-compose-v2
              
              # Start Docker and enable it to start on boot
              systemctl start docker
              systemctl enable docker
              
              # Give the default ubuntu user permissions to run docker
              usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "NearKart-Production-Server"
  }
}

# 4. Output the Public IP address so we know how to connect to it!
output "server_public_ip" {
  value       = aws_instance.nearkart_server.public_ip
  description = "The public IP address of the NearKart server"
}
