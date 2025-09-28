# 🛡️ SafeStay

SafeStay is a hackathon project designed to provide **secure and temporary housing solutions** for individuals in crisis situations. The platform connects homeowners willing to offer safe spaces with individuals in need, while integrating with external hotel APIs for fallback options.  

---

## ⚙️ Tech Stack Overview  

- **Frontend:** Angular 17 (TypeScript, SCSS)  
- **Backend:** Node.js + Express (REST API)  
- **Database:** PostgreSQL + Prisma ORM  
- **Authentication & Routing:** Angular Router + backend JWT authentication  
- **External APIs:** Amadeus API (Hotel Search & Offers)  
- **Infrastructure:** REST endpoints proxied via `/api`, deployed locally and adaptable to cloud  

---

## 🖥️ Frontend (Angular)  

- **Responsive Angular app** with a clean component structure.  
- Core features:  
  - Dynamic **home listings** (hosts can add and manage available listings).  
  - **Hotel request form** for users to request temporary stays (dates, number of guests, city).  
  - **User authentication UI** with registration and login forms.  
  - **Signal-based state management** (`signal()` from Angular 17) for reactive UI updates.  
  - Routing with `RouterOutlet` for multiple views (`/`, `/home-details`, `/requests`, `/login`).  

---

## 🔐 Registration & Login  

- **Registration flow:**  
  - User provides name, email, password, and role (guest or host).  
  - Backend validates input, hashes the password with bcrypt, and stores the record in Postgres via Prisma.  
  - On success, the user can log in immediately.  

- **Login flow:**  
  - User submits email + password.  
  - Backend verifies credentials against Postgres.  
  - If valid, the server issues a **JWT (JSON Web Token)**.  
  - Angular frontend stores the token securely and attaches it to API requests.  

- **Security measures:**  
  - Passwords hashed with bcrypt (never stored in plain text).  
  - Short-lived JWTs with role-based access.  
  - Middleware-protected API routes.  

---

## 🔗 Backend (Node + Express)  

- **REST API** under `/api`.  
- Handles:  
  1. Authentication (register, login, token verification).  
  2. Home listings (CRUD for homeowners).  
  3. Hotel requests (queries Amadeus API and stores offers).  
- Built-in validation and error handling (e.g., malformed requests return `400 Bad Request`).  

---

## 🏨 Amadeus API Integration  

- Integrated with **Amadeus for Developers** (test environment).  
- Flow:  
  1. Authenticate via `OAuth2` client credentials grant.  
  2. Query **Hotel Search API** for availability by `cityCode`.  
  3. Store **Amadeus hotel IDs + offer IDs** alongside user requests.  

- Enables **real hotel fallback options** if no SafeStay homes are available. 

---

## 🗄️ Database Layer (Postgres + Prisma)  

- **Database engine:** PostgreSQL  
- **ORM:** Prisma for schema definition, migrations, and type-safe queries.  
- **Schema includes:**  
  - `users` (id, name, email, hashed password, role: host/guest)  
  - `homes` (listings by homeowners)  
  - `requests` (housing requests tied to homes or hotels)  

- Prisma advantages:  
  - Automated migrations keep schema synced with Postgres.  
  - Type-safe queries prevent runtime errors.  
  - Easy to evolve schema during rapid hackathon development.  

---

## 🚀 End-to-End Workflow  

1. A new user **registers** or logs in to start a session.  
2. A homeowner logs in and **posts a safe home listing**.  
3. A user in need fills out a **request form** (dates, guests, notes).  
4. The user can check **available home listings**
5. If no homes are available, they can request funding for a stay at a hotel with look up powered by the **Amadeus** API.  
6. The request is stored in **Postgres via Prisma**, tagged with either a **homeId** or **hotel offer**.  
7. UI updates dynamically to show **safe housing matches + hotels**.  

---

## 💡 Conclusion 

- **Full-stack delivery** in hackathon time: frontend, backend, authentication, database, and external API integration.  
- Tackled **real-world complexity**: secure login, API auth, schema design, error handling.  
- Built with **production-ready practices**: JWT auth, role-based access, Prisma migrations, Angular signals.  
- Combines **social impact** (helping those in crisis) with **cutting-edge tech** (Amadeus hotel integration).  
