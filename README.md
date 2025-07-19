# Notes Web App

https://notes-web-app-x4hk.onrender.com/

---

## Description

A notes web app made using Node.js, Express and FAIL (https://github.com/fraserelliott/fail). The backend is a RESTful API handling user creation, deletion and login with routes for CRUD operations for notes that require authentication.

---

## Installation Instructions

1. Install dependencies
```bash
npm i
```

2. Create a .env file in the root of your project with the following or set these values with the hosting service

```
DATABASE_URL=postgresql://username:password@host:port/dbname
JWT_SECRET=your_jwt_secret_key
```

>⚠️ Never put this file or these variables anywhere publically accessible.

3. Create the tables in your PostgreSQL database

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users
(
    uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    pwhash text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (uuid),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.notes
(
    id integer NOT NULL DEFAULT nextval('notes_id_seq'::regclass),
    user_uuid uuid NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT notes_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
```

---

## License

MIT

---

## Author

Fraser Elliott
http://fraserdev.uk/
