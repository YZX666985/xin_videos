# Alibaba Cloud Ubuntu 22.04 Deployment Guide

This project can be deployed to an Alibaba Cloud ECS instance running Ubuntu 22.04 LTS.

## 1. Buy and prepare the server

Recommended starting point:

- `ECS`
- `Ubuntu 22.04 LTS 64-bit`
- `2 vCPU / 2 GB RAM`
- `40 GB` system disk
- open security group ports:
  - `22` for SSH
  - `80` for Nginx
  - `443` if you will use HTTPS later

## 2. Install base software

Connect to the server:

```bash
ssh root@YOUR_SERVER_IP
```

Update packages:

```bash
apt update && apt upgrade -y
```

Install Java 17, Nginx, and unzip:

```bash
apt install -y openjdk-17-jdk nginx unzip
java -version
systemctl enable nginx
systemctl start nginx
```

## 3. Upload the project

Upload the whole project or only the packaged jar.

If you want to build on the server, upload the whole project:

```bash
scp -r ./xin_vedios root@YOUR_SERVER_IP:/opt/
```

## 4. Build with Maven Wrapper

After uploading the project:

```bash
cd /opt/xin_vedios
chmod +x mvnw
./mvnw clean package
```

The jar will usually be generated under:

```bash
target/xin_vedios-0.0.1-SNAPSHOT.jar
```

## 5. Prepare runtime directories

```bash
mkdir -p /opt/xin-vedios
mkdir -p /var/log/xin-vedios
cp target/xin_vedios-0.0.1-SNAPSHOT.jar /opt/xin-vedios/app.jar
```

Create a dedicated user if needed:

```bash
useradd -r -s /usr/sbin/nologin www-data 2>/dev/null || true
chown -R www-data:www-data /opt/xin-vedios /var/log/xin-vedios
```

## 6. Install the systemd service

Copy the provided service file:

```bash
cp deploy/aliyun/xin-vedios.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable xin-vedios
systemctl start xin-vedios
systemctl status xin-vedios
```

Useful commands:

```bash
journalctl -u xin-vedios -f
systemctl restart xin-vedios
systemctl stop xin-vedios
```

## 7. Configure Nginx

Copy the provided Nginx config:

```bash
cp deploy/aliyun/nginx.conf /etc/nginx/sites-available/xin-vedios.conf
ln -sf /etc/nginx/sites-available/xin-vedios.conf /etc/nginx/sites-enabled/xin-vedios.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 8. Verify access

Check locally on the server:

```bash
curl http://127.0.0.1:8080
curl http://127.0.0.1
```

Then open in your browser:

```text
http://YOUR_SERVER_IP
```

## 9. Optional next steps

- bind a domain name
- add HTTPS with Certbot
- add a `prod` profile for production settings
- move parser channels into a separate environment-specific config file

## Notes

- If the server cannot access Maven Central, Maven Wrapper cannot download Maven automatically.
- This repository currently relies on external parsing endpoints, so production availability also depends on those third-party services.
