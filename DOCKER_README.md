# Docker Setup for Caffe Dalley

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

### Starting the Database

1. **Start Docker containers:**

   ```bash
   docker-compose up -d
   ```

2. **Check container status:**

   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f mysql
   ```

### Accessing MySQL via Web Interface (phpMyAdmin)

**URL:** http://localhost:8080

**Login Credentials:**

- **Username:** root
- **Password:** rootpassword

Setelah login, Anda akan melihat database `caffedalleydb` di sidebar kiri.

### Stopping the Database

```bash
docker-compose down
```

### Database Access

- **Host:** localhost
- **Port:** 3306
- **Database:** caffedalleydb
- **User:** root
- **Password:** rootpassword

### Backup Location

Database backups are mounted to `./server/backups` directory.

### Troubleshooting

If the database fails to start:

1. Check if port 3306 is already in use
2. Ensure Docker Desktop is running
3. Check logs: `docker-compose logs mysql`

If phpMyAdmin fails to start:

1. Check if port 8080 is already in use
2. Check logs: `docker-compose logs phpmyadmin`

### Resetting the Database

To completely reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

**Warning:** This will delete all data!
