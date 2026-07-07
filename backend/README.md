# Government IT Asset Management System - Backend

This is the robust, production-ready backend API for the Government IT Asset Management System. It is built using Node.js, Express.js, MySQL 8+, and Prisma ORM.

## Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher recommended)
2. **XAMPP** (Provides Apache server and MySQL Database)

---

## 1. XAMPP, MySQL, and phpMyAdmin Setup

Because this project uses MySQL, we use XAMPP to manage the local database server.

1. **Start XAMPP Control Panel.**
2. Click the **Start** button next to **Apache**.
3. Click the **Start** button next to **MySQL**.
   *(Ensure both turn green, indicating they are running).*
4. Click the **Admin** button next to MySQL. This will open **phpMyAdmin** in your browser (`http://localhost/phpmyadmin/`).
5. Inside phpMyAdmin, click on the **Databases** tab.
6. Create a new database named **`it_asset_management`**. (Choose `utf8mb4_unicode_ci` for the collation to fully support the Kurdish language).

---

## 2. Installation & Setup

1. Open your terminal and navigate to the `backend` folder.
2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment variables file to create your own configuration:
   ```bash
   cp .env.example .env
   ```
   *(Update the `.env` file with your specific secrets if necessary).*

---

## 3. Prisma & Database Commands

We use Prisma ORM to interact with our MySQL database securely.

1. **Generate the Prisma Client:**
   This reads the `schema.prisma` file and generates the exact JavaScript code needed to talk to your database.
   ```bash
   npm run prisma:generate
   ```

2. **Run Migrations (Create Tables):**
   This command applies our schema to the actual MySQL database in phpMyAdmin, creating all the tables (Users, Devices, Maintenance, etc.).
   ```bash
   npm run prisma:migrate
   ```

3. **Seed the Database:**
   This inserts the default Admin user and initial roles into the database so you can log in immediately.
   ```bash
   npm run seed
   ```

4. **View Database UI (Optional):**
   Prisma comes with a beautiful visual editor for your database. You can run:
   ```bash
   npm run prisma:studio
   ```

---

## 4. Running the Development Server

To run the server in development mode (it will automatically restart when you save a file):
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 5. Production Deployment

When deploying to a real production server (like a VPS or AWS):
1. Set the `NODE_ENV=production` inside your `.env` file.
2. Change default JWT secrets and database passwords.
3. Run the migrations `npm run prisma:migrate deploy`.
4. Start the application using a process manager like PM2:
   ```bash
   pm2 start src/server.js --name "it-asset-backend"
   ```

## Folder Structure Guide

- `src/controllers/` - Contains the logic for processing requests (e.g., handling a login).
- `src/middlewares/` - Security guards that intercept requests (Authentication, Rate limiting).
- `src/routes/` - Defines the API endpoints (e.g., `POST /api/auth/login`).
- `src/services/` - Business logic and direct interactions with Prisma.
- `prisma/` - Database schema and seed data.
