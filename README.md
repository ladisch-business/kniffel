# Kniffel - Würfelspiel Web-Applikation

Eine moderne, plattformübergreifende Web-Applikation für das beliebte Würfelspiel Kniffel mit innovativen Spielmodi und sozialem Multiplayer-Erlebnis.

## 🎯 Projektübersicht

Diese Anwendung bietet eine vollständige Kniffel-Spielerfahrung mit:
- **3 Spielmodi**: Klassisches Kniffel, "Eins muss weg", "Multi-Block"
- **Optionale Regeln**: Turniermodus, Joker-Kniffel, Schnelles Spiel
- **Multiplayer**: 2-10 Spieler mit KI-Gegnern
- **Soziale Features**: Freundeslisten, Statistiken, Bestenlisten
- **PWA**: Installierbar auf Desktop und Mobilgeräten
- **Skeuomorphes Design**: Realistische Holztisch-Optik mit Würfel-Animationen

## 🛠 Technische Spezifikationen

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Datenbank**: PostgreSQL 15
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS + Framer Motion
- **PWA**: Vite PWA Plugin
- **Deployment**: Docker + Docker Compose

## 📋 Funktionen

### Benutzerverwaltung
- Registrierung und Login mit Benutzername/Passwort
- Spielerprofile mit umfangreichen Statistiken
- Freundeslisten und Freundschaftsanfragen
- Globale Bestenlisten mit Filteroptionen

### Spielmodi
1. **Klassisches Kniffel**: Standard-Regelwerk mit bis zu 3 Würfen pro Runde
2. **"Eins muss weg"**: Nach jedem Wurf muss mindestens ein Würfel beiseitegelegt werden
3. **"Multi-Block"**: Spieler können 1-10 parallele Spielblöcke führen

### Optionale Regeln
- **Turniermodus**: Eliminierungs-Wettbewerb für bis zu 10 Spieler
- **Joker-Kniffel**: Weitere Kniffels können als Joker eingesetzt werden
- **Schnelles Spiel**: Zeitlimit von 1-2 Minuten pro Zug

### Design & UX
- **Skeuomorphe Optik**: Holztisch, physische Würfel, Papier-Spielblock
- **Light/Dark Mode**: Heller Modus und Anthrazit-Dunkel-Modus
- **Animationen**: Realistische Würfel-Animationen mit Framer Motion
- **Soundeffekte**: Würfeln, Button-Klicks, besondere Ereignisse
- **Responsive**: Optimiert für Desktop und Mobile

## 🚀 Installation und Deployment

### Voraussetzungen
- Docker und Docker Compose
- Git
- Mindestens 2GB RAM
- Freie Ports: 3000 (Frontend), 3001 (Backend), 5432 (PostgreSQL)

### Schnellstart mit Docker

1. **Repository klonen**
```bash
git clone https://github.com/ladisch-business/kniffel.git
cd kniffel
```

2. **Umgebungsvariablen konfigurieren**
```bash
# Backend-Konfiguration
cp backend/.env.example backend/.env
# Bearbeiten Sie backend/.env nach Bedarf:
# - JWT_SECRET: Ändern Sie den JWT-Schlüssel für Produktion
# - DATABASE_URL: Wird automatisch von Docker Compose gesetzt
```

3. **Anwendung starten**
```bash
# Alle Services starten (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Logs verfolgen (optional)
docker-compose logs -f
```

4. **Anwendung öffnen**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manuelle Installation (Entwicklung)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# PostgreSQL-Datenbank starten
docker-compose up -d postgres
# Backend starten
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
# Frontend starten
npm run dev
```

#### Datenbank initialisieren
```bash
# Datenbank erstellen und Schema laden
docker exec kniffel-postgres-1 psql -U kniffel_user -d postgres -c "CREATE DATABASE kniffel_db;"
docker exec kniffel-postgres-1 psql -U kniffel_user -d kniffel_db -f /docker-entrypoint-initdb.d/init.sql
```

## 🔧 Konfiguration

### Umgebungsvariablen

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://kniffel_user:kniffel_password@postgres:5432/kniffel_db
JWT_SECRET=ihr-super-sicherer-jwt-schluessel-aendern-in-produktion
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
# Development environment
VITE_API_URL=http://localhost:3001/api

# Production environment (uses relative URLs)
# VITE_API_URL="" or omit entirely - nginx will proxy /api to backend
```

### Docker Compose Konfiguration

**Wichtig für Produktionsumgebung:**
- Das Frontend ist so konfiguriert, dass es relative URLs (`/api`) verwendet
- Nginx fungiert als Reverse Proxy und leitet API-Anfragen an den Backend-Service weiter
- In der Entwicklung wird `VITE_API_URL=http://localhost:3001/api` verwendet
- In der Produktion wird `VITE_API_URL=""` verwendet (relative URLs)

**Für detaillierte Produktions-Deployment-Anleitung mit Nginx Proxy Manager siehe:** [DEPLOYMENT.md](DEPLOYMENT.md)

### Docker Compose Konfiguration

Die `docker-compose.yml` definiert drei Services:
- **postgres**: PostgreSQL-Datenbank mit persistentem Volume
- **backend**: Express.js API-Server
- **frontend**: Nginx-Server mit React-Build

## 📊 Datenbankschema

Die Anwendung verwendet folgende Haupttabellen:
- `users`: Benutzerkonten
- `games`: Spielsitzungen
- `game_players`: Spieler in Spielen
- `score_blocks`: Punkteblöcke
- `game_turns`: Spielzüge
- `user_statistics`: Spielerstatistiken
- `friendships`: Freundschaften

## 🎮 Spielanleitung

### Neues Spiel erstellen
1. Auf "Neues Spiel erstellen" klicken
2. Spielmodus auswählen (Klassisch, Eins muss weg, Multi-Block)
3. Spieleranzahl und KI-Gegner festlegen
4. Optionale Regeln aktivieren
5. Spiel als öffentlich oder privat markieren

### Spielablauf
1. Würfeln (bis zu 3 Mal pro Runde)
2. Würfel zum Behalten auswählen
3. Kategorie für Punkteeintragung wählen
4. Nächster Spieler ist dran

### Punktesystem
- **Oberer Block**: Einser bis Sechser (Bonus bei ≥63 Punkten)
- **Unterer Block**: Dreierpasch, Viererpasch, Full House, etc.
- **Kniffel**: 50 Punkte (weitere als Joker verwendbar)

## 🔍 Troubleshooting

### Häufige Probleme

**Port bereits belegt**
```bash
# Prüfen welcher Prozess den Port verwendet
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Docker-Container stoppen
docker-compose down
```

**Datenbank-Verbindungsfehler**
```bash
# PostgreSQL-Container-Status prüfen
docker-compose ps postgres
docker-compose logs postgres

# Datenbank neu initialisieren
docker-compose down -v
docker-compose up -d postgres
# Warten bis PostgreSQL bereit ist, dann Schema laden
```

**Frontend Build-Fehler**
```bash
cd frontend
npm install
npm run build
```

**Backend TypeScript-Fehler**
```bash
cd backend
npm install
npm run build
```

### Logs einsehen
```bash
# Alle Services
docker-compose logs

# Spezifischer Service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Live-Logs verfolgen
docker-compose logs -f
```

## 🚀 Produktions-Deployment

### Server-Anforderungen
- Ubuntu 20.04+ oder ähnliche Linux-Distribution
- Docker und Docker Compose installiert
- Mindestens 2GB RAM, 10GB Speicher
- Öffentliche IP-Adresse oder Domain

### Deployment-Schritte

1. **Server vorbereiten**
```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Anwendung deployen**
```bash
# Repository klonen
git clone https://github.com/ladisch-business/kniffel.git
cd kniffel

# Produktions-Konfiguration
cp backend/.env.example backend/.env
# JWT_SECRET und andere Produktionswerte setzen

# Anwendung starten
docker-compose up -d
```

3. **Reverse Proxy (optional)**
```nginx
# /etc/nginx/sites-available/kniffel
server {
    listen 80;
    server_name ihre-domain.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🧪 Entwicklung

### Entwicklungsumgebung einrichten
```bash
# Repository klonen
git clone https://github.com/ladisch-business/kniffel.git
cd kniffel

# Backend-Abhängigkeiten
cd backend
npm install

# Frontend-Abhängigkeiten
cd ../frontend
npm install

# Datenbank starten
docker-compose up -d postgres
```

### Verfügbare Scripts

#### Backend
```bash
npm run dev          # Entwicklungsserver mit Hot-Reload
npm run build        # TypeScript kompilieren
npm run start        # Produktionsserver starten
npm run test         # Tests ausführen
```

#### Frontend
```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run preview      # Build-Vorschau
npm run test         # Tests ausführen
```

### Code-Struktur

```
kniffel/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API-Controller
│   │   ├── models/         # Datenmodelle
│   │   ├── routes/         # API-Routen
│   │   ├── services/       # Business-Logic
│   │   ├── middleware/     # Express-Middleware
│   │   ├── database/       # DB-Konfiguration
│   │   └── types/          # TypeScript-Typen
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React-Komponenten
│   │   ├── pages/          # Seiten-Komponenten
│   │   ├── stores/         # Zustand-Management
│   │   ├── services/       # API-Services
│   │   ├── types/          # TypeScript-Typen
│   │   └── styles/         # CSS-Dateien
│   ├── public/             # Statische Assets
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 📝 API-Dokumentation

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden

### Spiele
- `GET /api/games/public` - Öffentliche Spiele abrufen
- `POST /api/games` - Neues Spiel erstellen
- `GET /api/games/:id` - Spiel-Details abrufen
- `POST /api/games/:id/join` - Spiel beitreten

### Benutzer
- `GET /api/users/profile` - Benutzerprofil abrufen
- `GET /api/users/statistics` - Benutzerstatistiken
- `GET /api/users/friends` - Freundesliste
- `POST /api/users/friends` - Freundschaftsanfrage senden

## 🤝 Beitragen

1. Fork des Repositories erstellen
2. Feature-Branch erstellen (`git checkout -b feature/neue-funktion`)
3. Änderungen committen (`git commit -am 'Neue Funktion hinzufügen'`)
4. Branch pushen (`git push origin feature/neue-funktion`)
5. Pull Request erstellen

## 📄 Lizenz

© 2024 Kniffel Game. Entwickelt mit React, TypeScript und Express.js.

## 🆘 Support

Bei Problemen oder Fragen:
1. Prüfen Sie die Troubleshooting-Sektion
2. Schauen Sie in die GitHub Issues
3. Erstellen Sie ein neues Issue mit detaillierter Problembeschreibung

---

**Viel Spaß beim Kniffeln! 🎲**
