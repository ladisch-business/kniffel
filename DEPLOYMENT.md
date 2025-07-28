# Kniffel Deployment Anleitung mit Nginx Proxy Manager

## Übersicht der Deployment-Optionen

Diese Anleitung bietet zwei Deployment-Optionen:

1. **Option A**: Alles über eine Domain (empfohlen) - `kniffel.ladisch-energie.de`
2. **Option B**: Separate Backend-Subdomain - `api.ladisch-energie.de` für Backend

## Option A: Alles über eine Domain (Empfohlen)

### 1. Umgebungsvariablen erstellen

Erstellen Sie folgende `.env` Dateien auf Ihrem Server:

#### `/path/to/kniffel/.env` (Hauptverzeichnis)
```env
# Produktionsumgebung
NODE_ENV=production
POSTGRES_DB=kniffel
POSTGRES_USER=kniffel_user
POSTGRES_PASSWORD=IHR_SICHERES_PASSWORT_HIER
JWT_SECRET=IHR_SUPER_SICHERER_JWT_SCHLUESSEL_HIER
FRONTEND_URL=https://kniffel.ladisch-energie.de
```

#### `/path/to/kniffel/backend/.env` (Backend-Verzeichnis)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://kniffel_user:IHR_SICHERES_PASSWORT_HIER@postgres:5432/kniffel
JWT_SECRET=IHR_SUPER_SICHERER_JWT_SCHLUESSEL_HIER
FRONTEND_URL=https://kniffel.ladisch-energie.de
CORS_ORIGIN=https://kniffel.ladisch-energie.de
```

#### `/path/to/kniffel/frontend/.env.production` (Frontend-Verzeichnis)
```env
# Produktionsumgebung - verwendet relative URLs
# VITE_API_URL wird leer gelassen, damit nginx die Anfragen weiterleitet
# Das Frontend wird über /api mit dem Backend kommunizieren
```

### 2. Docker Compose für Produktion anpassen

Erstellen Sie eine `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - kniffel-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      FRONTEND_URL: https://kniffel.ladisch-energie.de
    depends_on:
      - postgres
    networks:
      - kniffel-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: ""
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - kniffel-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  kniffel-network:
    driver: bridge
```

### 3. Nginx Proxy Manager Konfiguration (Option A)

#### Schritt 1: Proxy Host erstellen
1. Öffnen Sie Nginx Proxy Manager Admin Interface
2. Gehen Sie zu "Proxy Hosts" → "Add Proxy Host"

#### Schritt 2: Domain Details
- **Domain Names**: `kniffel.ladisch-energie.de`
- **Scheme**: `http`
- **Forward Hostname/IP**: `IHR_SERVER_IP` (oder Docker-Container-Name wenn NPM im gleichen Docker-Netzwerk läuft)
- **Forward Port**: `3000`
- **Cache Assets**: ✅ Aktiviert
- **Block Common Exploits**: ✅ Aktiviert
- **Websockets Support**: ✅ Aktiviert (wichtig für Socket.IO)

#### Schritt 3: SSL Konfiguration
- Gehen Sie zum "SSL" Tab
- **SSL Certificate**: "Request a new SSL Certificate"
- **Force SSL**: ✅ Aktiviert
- **HTTP/2 Support**: ✅ Aktiviert
- **HSTS Enabled**: ✅ Aktiviert
- **Email**: Ihre E-Mail-Adresse für Let's Encrypt

#### Schritt 4: Advanced Konfiguration (Option A)
Fügen Sie im "Advanced" Tab folgende Nginx-Konfiguration hinzu:

```nginx
# API und Socket.IO Weiterleitung zum Backend
location /api {
    proxy_pass http://IHR_SERVER_IP:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    
    # CORS Headers für API
    add_header Access-Control-Allow-Origin "https://kniffel.ladisch-energie.de" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://kniffel.ladisch-energie.de";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        add_header Access-Control-Allow-Credentials "true";
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
}

location /socket.io {
    proxy_pass http://IHR_SERVER_IP:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# PWA Manifest und Service Worker (wichtig für PWA-Funktionalität)
location /manifest.json {
    add_header Cache-Control "public, max-age=0";
    add_header Content-Type "application/json";
}

location /sw.js {
    add_header Cache-Control "public, max-age=0";
    add_header Content-Type "application/javascript";
}

location /workbox-*.js {
    add_header Cache-Control "public, max-age=0";
    add_header Content-Type "application/javascript";
}

# PWA Icons
location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Option B: Separate Backend-Subdomain

Falls Sie eine separate Backend-Subdomain verwenden möchten:

### 1. Umgebungsvariablen für Option B

#### `/path/to/kniffel/.env` (Hauptverzeichnis)
```env
# Produktionsumgebung mit separater Backend-Subdomain
NODE_ENV=production
POSTGRES_DB=kniffel
POSTGRES_USER=kniffel_user
POSTGRES_PASSWORD=IHR_SICHERES_PASSWORT_HIER
JWT_SECRET=IHR_SUPER_SICHERER_JWT_SCHLUESSEL_HIER
FRONTEND_URL=https://kniffel.ladisch-energie.de
BACKEND_URL=https://api.ladisch-energie.de
```

#### `/path/to/kniffel/backend/.env` (Backend-Verzeichnis)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://kniffel_user:IHR_SICHERES_PASSWORT_HIER@postgres:5432/kniffel
JWT_SECRET=IHR_SUPER_SICHERER_JWT_SCHLUESSEL_HIER
FRONTEND_URL=https://kniffel.ladisch-energie.de
CORS_ORIGIN=https://kniffel.ladisch-energie.de
```

#### `/path/to/kniffel/frontend/.env.production` (Frontend-Verzeichnis)
```env
# Produktionsumgebung mit separater Backend-Subdomain
VITE_API_URL=https://api.ladisch-energie.de/api
```

### 2. Docker Compose für Option B

Erstellen Sie eine `docker-compose.backend-subdomain.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - kniffel-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      FRONTEND_URL: ${FRONTEND_URL}
      CORS_ORIGIN: ${FRONTEND_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    networks:
      - kniffel-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: ${BACKEND_URL}/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - kniffel-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  kniffel-network:
    driver: bridge
```

### 3. Nginx Proxy Manager für Option B

#### Frontend Proxy Host (kniffel.ladisch-energie.de)
- **Domain Names**: `kniffel.ladisch-energie.de`
- **Forward Hostname/IP**: `IHR_SERVER_IP`
- **Forward Port**: `3000`
- **SSL**: Let's Encrypt aktiviert

#### Backend Proxy Host (api.ladisch-energie.de)
- **Domain Names**: `api.ladisch-energie.de`
- **Forward Hostname/IP**: `IHR_SERVER_IP`
- **Forward Port**: `3001`
- **Websockets Support**: ✅ Aktiviert
- **SSL**: Let's Encrypt aktiviert

**Advanced Konfiguration für Backend (api.ladisch-energie.de):**
```nginx
# CORS Headers
add_header Access-Control-Allow-Origin "https://kniffel.ladisch-energie.de" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
add_header Access-Control-Allow-Credentials "true" always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin "https://kniffel.ladisch-energie.de";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    add_header Access-Control-Allow-Credentials "true";
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
}
```

### 4. Deployment Schritte

#### Schritt 1: Repository klonen
```bash
cd /path/to/your/apps
git clone https://github.com/ladisch-business/kniffel.git
cd kniffel
```

#### Schritt 2: Umgebungsvariablen setzen
```bash
# Hauptverzeichnis .env erstellen
cp .env.example .env
nano .env

# Backend .env erstellen
cp backend/.env.example backend/.env
nano backend/.env

# Sichere Passwörter und JWT-Secret generieren
openssl rand -base64 32  # Für JWT_SECRET
openssl rand -base64 16  # Für POSTGRES_PASSWORD
```

**Wichtige Werte in .env setzen:**
```bash
# Beispiel für sichere Werte
POSTGRES_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=https://kniffel.ladisch-energie.de

# Für Option B zusätzlich:
# BACKEND_URL=https://api.ladisch-energie.de
```

#### Schritt 3: Docker Container starten

**Für Option A (eine Domain):**
```bash
docker-compose up -d
```

**Für Option B (Backend-Subdomain):**
```bash
docker-compose -f docker-compose.backend-subdomain.yml up -d
```

#### Schritt 4: Logs überprüfen
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres

# Spezifische Fehlersuche
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
```

#### Schritt 5: Gesundheitsprüfung
```bash
# Backend API testen
curl http://localhost:3001/api/health

# Frontend testen
curl http://localhost:3000

# Datenbank-Verbindung testen
docker-compose exec postgres psql -U kniffel_user -d kniffel -c "SELECT version();"
```

### 5. Troubleshooting

#### Problem: Backend-Verbindungsfehler (ERR_CONNECTION_REFUSED)
**Diagnose:**
```bash
# Prüfen ob Backend läuft
docker-compose ps backend
curl http://localhost:3001/api/health

# Nginx Proxy Manager Logs prüfen
docker logs nginx-proxy-manager
```

**Lösungen:**
1. **Nginx Proxy Manager Konfiguration prüfen:**
   - Stellen Sie sicher, dass `/api` und `/socket.io` korrekt weitergeleitet werden
   - Überprüfen Sie die Forward-IP und Port (3001 für Backend)
   - Aktivieren Sie "Websockets Support" für Socket.IO

2. **Docker-Netzwerk-Probleme:**
   ```bash
   # Wenn NPM im gleichen Docker-Netzwerk läuft
   # Verwenden Sie Container-Namen statt IP-Adressen
   # Forward Hostname: kniffel-backend-1 (oder ähnlich)
   docker network ls
   docker network inspect kniffel_kniffel-network
   ```

3. **Firewall-Probleme:**
   ```bash
   # Ports freigeben
   sudo ufw allow 3000
   sudo ufw allow 3001
   ```

#### Problem: CORS-Fehler
**Lösung:**
- Überprüfen Sie die CORS-Konfiguration in der Advanced-Nginx-Konfiguration
- Stellen Sie sicher, dass `FRONTEND_URL` in backend/.env korrekt gesetzt ist
- Für Option B: Prüfen Sie die CORS-Headers für die Backend-Subdomain

#### Problem: PWA Installation funktioniert nicht
**Diagnose:**
```bash
# Browser-Konsole prüfen (F12)
# Suchen Sie nach Service Worker und Manifest-Fehlern
```

**Lösungen:**
- Überprüfen Sie, dass HTTPS aktiviert ist (PWA erfordert HTTPS)
- Stellen Sie sicher, dass `/manifest.json` und `/sw.js` korrekt geladen werden
- Prüfen Sie die PWA-spezifischen Nginx-Regeln in der Advanced-Konfiguration

#### Problem: Socket.IO Verbindung fehlschlägt
**Diagnose:**
```bash
# Browser-Konsole prüfen
# Suchen Sie nach WebSocket-Verbindungsfehlern
```

**Lösungen:**
1. **Nginx Proxy Manager:**
   - Aktivieren Sie "Websockets Support" in den Proxy Host Einstellungen
   - Überprüfen Sie die `/socket.io` Weiterleitung in der Advanced-Konfiguration

2. **Backend-Konfiguration:**
   ```bash
   # Prüfen Sie die Socket.IO-Konfiguration im Backend
   docker-compose logs backend | grep -i socket
   ```

#### Problem: Umgebungsvariablen werden nicht geladen
**Lösung:**
```bash
# Prüfen Sie die .env-Dateien
cat .env
cat backend/.env

# Docker-Container neu starten
docker-compose down
docker-compose up -d

# Umgebungsvariablen im Container prüfen
docker-compose exec backend env | grep -E "(JWT_SECRET|DATABASE_URL|FRONTEND_URL)"
```

#### Problem: Datenbank-Verbindungsfehler
**Diagnose:**
```bash
# PostgreSQL-Container prüfen
docker-compose logs postgres
docker-compose exec postgres psql -U kniffel_user -d kniffel -c "\dt"
```

**Lösung:**
```bash
# Datenbank neu initialisieren
docker-compose down -v  # ACHTUNG: Löscht alle Daten!
docker-compose up -d postgres
# Warten bis PostgreSQL bereit ist
sleep 10
docker-compose up -d backend frontend
```

### 6. Sicherheitshinweise

1. **Passwörter ändern**: Verwenden Sie sichere, einzigartige Passwörter
2. **JWT Secret**: Generieren Sie einen starken JWT-Secret
3. **Firewall**: Öffnen Sie nur die notwendigen Ports (80, 443)
4. **Updates**: Halten Sie Docker-Images regelmäßig aktuell
5. **Backups**: Erstellen Sie regelmäßige Backups der PostgreSQL-Datenbank

### 7. Wartung

#### Backup der Datenbank
```bash
docker-compose exec postgres pg_dump -U kniffel_user kniffel > backup_$(date +%Y%m%d).sql
```

#### Updates deployen
```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Container-Status überprüfen
```bash
docker-compose ps
docker-compose logs --tail=50 -f
```
