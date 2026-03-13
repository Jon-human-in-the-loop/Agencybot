# 🚀 Guía de Despliegue - AgencyBot

## Despliegue en Vercel

### Requisitos previos
- Cuenta de Vercel (https://vercel.com)
- Node.js 22+
- `pnpm` instalado
- Variables de entorno configuradas

### Pasos de despliegue

#### 1. Conectar repositorio a Vercel

```bash
# Opción A: Desde la CLI
npm i -g vercel
vercel

# Opción B: Desde dashboard
# Ve a https://vercel.com/new
# Selecciona tu repositorio de GitHub/GitLab/Bitbucket
```

#### 2. Configurar variables de entorno en Vercel

En el dashboard de Vercel, ve a **Settings > Environment Variables** y añade:

```
VITE_APP_ID=your-app-id
JWT_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=<your-mysql-connection-string>
OAUTH_SERVER_URL=https://your-auth-domain.com
BUILT_IN_FORGE_API_URL=<your-llm-api-endpoint>
BUILT_IN_FORGE_API_KEY=<your-api-key>
ENCRYPTION_MASTER_KEY=<generate-with-node-crypto>
```

#### 3. Desplegar

```bash
vercel --prod
```

El sitio se desplegará en `https://your-project.vercel.app`

---

## Despliegue en Railway

### Requisitos previos
- Cuenta de Railway (https://railway.app)
- Un repositorio git configurado

### Pasos de despliegue

#### 1. Conectar repositorio

1. Ve a https://railway.app/dashboard
2. Click en "New Project"
3. Selecciona "Deploy from GitHub"
4. Conecta tu repositorio

#### 2. Configurar variables de entorno

En Railroad, ve a **Variables** y configura:

```
NODE_ENV=production
VITE_APP_ID=your-app-id
JWT_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=mysql://user:pass@host:3306/agencybot
OAUTH_SERVER_URL=https://your-auth-domain.com
BUILT_IN_FORGE_API_URL=https://your-llm-api.com/v1
BUILT_IN_FORGE_API_KEY=<your-key>
ENCRYPTION_MASTER_KEY=<generate-with-node-crypto>
```

#### 3. Configurar build & start

Railway automáticamente detectará `package.json` y ejecutará:
- **Build**: `pnpm build`
- **Start**: `pnpm start`

#### 4. Conectar dominio personalizado

1. En Railway, ve a **Settings**
2. En "Domains", añade tu dominio personalizado
3. Actualiza tu DNS con los CNAME records proporcionados

---

## Despliegue en tu propio servidor

### Opción 1: Docker

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
```

Construir y ejecutar:
```bash
docker build -t agencybot .
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  agencybot
```

### Opción 2: Servidor Linux (Ubuntu/Debian)

```bash
# 1. Instalar dependencias
sudo apt-get update
sudo apt-get install -y nodejs npm

# 2. Instalar pnpm
npm install -g pnpm

# 3. Clonar repositorio
git clone https://github.com/your-org/Agencybot.git
cd Agencybot

# 4. Instalar dependencias del proyecto
pnpm install

# 5. Configurar variables de entorno
cp .env.example .env
nano .env  # editar con tus valores

# 6. Build
pnpm build

# 7. Iniciar con PM2 (recomendado)
npm install -g pm2
pm2 start "pnpm start" --name agencybot
pm2 save
pm2 startup
```

---

## Configuración de Base de Datos

### MySQL en la nube

#### Opción 1: Railway (recomendado)
1. En tu proyecto de Railway, click **New Service**
2. Selecciona **MySQL**
3. Railway generará automáticamente `DATABASE_URL`
4. Copia en tus variables de entorno

#### Opción 2: PlanetScale (compatible con MySQL)
```bash
pscale auth login
pscale database create agencybot
pscale branch create agencybot main
pscale connect agencybot main
```

Obtén el string de conexión y configúralo en `.env`

#### Opción 3: TiDB Cloud (escalable)
1. Ve a https://tidbcloud.com
2. Crea un cluster
3. Obtén la conexión string MySQL
4. Configura en `.env`

### Migraciones de base de datos

Después de desplegar, ejecuta migraciones:

```bash
# Desde tu máquina local (antes de desplegar)
DATABASE_URL="your-production-db" pnpm db:push

# O en el servidor
pnpm db:push
```

---

## Configuración de OAuth

### Tu propio servidor OAuth

Si necesitas implementar tu propio servidor OAuth:

1. Implementa los endpoints requeridos por `authTypes.ts`:
   - `POST /webdev.v1.WebDevAuthPublicService/ExchangeToken`
   - `POST /webdev.v1.WebDevAuthPublicService/GetUserInfo`
   - `POST /webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`

2. Actualiza `OAUTH_SERVER_URL` en `.env`

3. Asegúrate que tu servidor devuelva la estructura correcta:
   ```typescript
   {
     accessToken: string;
     tokenType: string;
     expiresIn: number;
     refreshToken?: string;
     scope: string;
     idToken: string;
   }
   ```

---

## Monitoreo y logs

### Railway
```bash
# Ver logs en tiempo real
railway logs

# Conectar con SSH
railway shell
```

### Vercel
Dashboard automático: https://vercel.com/dashboard

### Servidor propio con PM2
```bash
pm2 logs agencybot
pm2 monit
```

---

## Certificado SSL

### Vercel y Railway
✅ Automático con Let's Encrypt

### Servidor propio

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado (sustituir dominio)
sudo certbot certonly --standalone -d tu-dominio.com

# Renovación automática
sudo systemctl enable certbot.timer
```

---

## Variables de entorno obligatorias para producción

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Siempre `production` | `production` |
| `DATABASE_URL` | Conexión a BD | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Clave para sesiones (32 bytes base64) | `openssl rand -base64 32` |
| `VITE_APP_ID` | ID único de la app | `agencybot-prod` |
| `OAUTH_SERVER_URL` | URL de tu servidor OAuth | `https://auth.tudominio.com` |
| `BUILT_IN_FORGE_API_URL` | Endpoint del LLM | `https://api.openai.com/v1` |
| `BUILT_IN_FORGE_API_KEY` | API key del LLM | `sk_...` |
| `ENCRYPTION_MASTER_KEY` | Clave de encriptación (32 bytes base64) | `node -e "..." ` |

---

## Generador de claves seguras

```bash
# JWT_SECRET (32 bytes base64)
openssl rand -base64 32

# ENCRYPTION_MASTER_KEY (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Troubleshooting

### Error: "DATABASE_URL is not configured"
✓ Verifica que configuraste `DATABASE_URL` en variables de entorno
✓ Prueba la conexión: `mysql -u user -p -h host -D database -e "SELECT 1;"`

### Error: "OAUTH_SERVER_URL is not configured"
✓ Configura `OAUTH_SERVER_URL` en tus variables de entorno
✓ Asegúrate que el servidor OAuth es accesible desde la app

### Error: "BUILT_IN_FORGE_API_URL is required"
✓ El LLM interno ahora requiere configuración explícita
✓ Configura `BUILT_IN_FORGE_API_URL` y `BUILT_IN_FORGE_API_KEY`

### Errores de SSL en desarrollo
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dev
```

Nunca uses esto en producción.

---

## Performance en producción

### Optimizaciones

1. **Cachés**
   ```bash
   # Habilitar Redis si está disponible
   REDIS_URL=redis://...
   ```

2. **Base de datos**
   ```sql
   CREATE INDEX idx_user_session ON conversation_sessions(userId);
   CREATE INDEX idx_bot_active ON bot_profiles(isActive);
   ```

3. **Compresión**
   - Vercel y Railway habilitan automáticamente gzip

4. **CDN**
   - Vercel usa Vercel Edge Network automáticamente
   - Railway recomienda usar Cloudflare

---

## Backup y recuperación

### Backup de BD

```bash
# MySQL local
mysqldump -u user -p database > backup.sql

# Restaurar
mysql -u user -p database < backup.sql
```

### Con Railway
✓ Railway gestiona automáticamente backups diarios

### Backup de archivos (S3)
```bash
# Configurar AWS_S3_* si usas S3
AWS_S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

**¿Preguntas?** Revisa [DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md) o abre un issue en GitHub.
