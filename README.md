# Backend Node API (Nutech Assignment)

REST API: Registrasi, Login, Profile, Banner, Services, Balance, Top Up, Transaksi.

- OpenAPI/Swagger: served at `/docs` (JSON at `/docs-json`)
- DB: PostgreSQL (raw SQL with prepared statements via `pg`)
- Auth: JWT Bearer

## Env Vars

Create a `.env` locally from `.env.example` or set these in Railway Variables:

- `NODE_ENV` (production on Railway)
- `PORT` (Railway provides automatically)
- `JWT_SECRET` (required)
- `POSTGRES_URL` or `DATABASE_URL` (preferred single URL on Railway)
  - Fallback discrete vars for local: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

## Run Locally

```bash
npm install
# Import schema & seed
psql "$DATABASE_URL" -f db/ddl.sql
# or with discrete vars
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f db/ddl.sql

npm run dev
# Swagger: http://localhost:3000/docs
```

## Deploy to Railway (PostgreSQL)

1. Push repository to GitHub
2. Railway Dashboard → New Project → Deploy from GitHub (select this repo)
3. Add → Database → PostgreSQL
   - Railway will provision and set `POSTGRES_URL` (or discrete POSTGRES\_\* vars)
4. Project → Variables: set also `JWT_SECRET` and `NODE_ENV=production`
5. The app uses `start` script automatically (`npm start`).
6. Import schema and seeds into Railway DB (from your laptop):

```bash
psql "$POSTGRES_URL" -f db/ddl.sql
# or using discrete variables with sslmode
psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB?sslmode=require" -f db/ddl.sql
```

7. Open `https://<your-app>.up.railway.app/docs`

## Notes

- File uploads are stored under `/uploads` on the instance. Railway filesystem is ephemeral; persisted file storage should use object storage (e.g., Cloudinary/S3/Supabase) for production.
- The app sets `trust proxy` to generate correct absolute URLs behind proxies.
- Responses follow the contract: `{ status, message, data }` with codes 0/102/103/108.
