#!/bin/bash
# setup.sh - Automated server configuration script for SmartLink
# Run this on App-Server to install Docker and Node Exporter

set -e  # Stop script if any command fails

echo "========================================="
echo "   SmartLink App-Server Setup Script"
echo "========================================="

echo "[1/4] Updating system packages..."
sudo apt update -y && sudo apt upgrade -y

echo "[2/4] Installing Docker..."
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

echo "[3/4] Installing Node Exporter for monitoring..."
cd /tmp
wget -q https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
tar xvf node_exporter-1.7.0.linux-amd64.tar.gz

sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.7.0.linux-amd64*

echo "[4/4] Creating Node Exporter systemd service..."
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=ubuntu
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

echo "========================================="
echo "   Setup Complete! All services running."
echo "========================================="
echo "Docker installed and running"
echo "Node Exporter: http://localhost:9100/metrics"