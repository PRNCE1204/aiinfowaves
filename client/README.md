# AI InfoWave: Official Platform Documentation

**AI InfoWave** is a robust, full-stack, enterprise-grade web application designed to bridge the gap between advanced artificial intelligence solutions and everyday business needs. Servicing sectors such as Bioinformatics & Health AI, Agriculture AI, and Small Business Technology consulting, the platform functions as both a client onboarding portal and a comprehensive talent acquisition hub for career opportunities and structured internships.

Built on the modern **MERN Stack** (MongoDB, Express, React, Node.js) with **Vite** as the frontend bundler, the site delivers a premium sci-fi inspired UI characterized by advanced custom canvas animations, responsive interactive layouts, secure email/JWT authentication, and OAuth 2.0 logins.

---

## 🚀 Key Features

*   **Premium Interactive Visuals:** Core pages feature custom HTML5 canvas rendering (e.g., dynamic atomic constellations and PCB circuit pathways) alongside smooth motion layouts via Framer Motion.
*   **Dual Talent Acquisition Gateways:** Dedicated modules for professional career applications and structured student internships.
*   **3-Step Scheduling Wizard:** A customized booking module for consultation scheduling featuring active date calculations and real-time conflict checking.
*   **Multi-Engine Biomedical Portals:** Specialized service showcases detailing bioinformatics pipelines for Next-Generation Sequencing (NGS) and Proteomics analysis.
*   **Research Innovation Hub:** An Open Project Call channel allowing institutional researchers to submit project outlines securely under strict NDA compliance.
*   **Admin Management Console:** Secure panel to search, filter, track, and modify statuses of internship applicants.
*   **High-Security Controls:** Implemented Session Guard middleware to enforce token expiration, bcrypt encryption for credentials, and Google OAuth 2.0.

---

## 🛠️ Technology Stack

### Frontend (Client-side)
*   **Framework:** React (v19) & React Router DOM (v6)
*   **Build Tool:** Vite
*   **Styling & Icons:** CSS Modules, Tailwind CSS, Lucide React
*   **State & Logic:** React Hook Form, Custom hooks for authentication
*   **Animations:** Framer Motion, HTML5 2D Canvas (Context rendering loops)
*   **HTTP client:** Axios

### Backend (Server-side)
*   **Platform:** Node.js
*   **Framework:** Express.js (v5)
*   **Authentication:** JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0 Strategy), Bcrypt.js (Password hashing)
*   **Database ODM:** Mongoose (MongoDB Atlas connection)
*   **Mailing Service:** Resend & Nodemailer integrations
*   **CORS & Session:** Express Session, strict origin CORS configuration

---

## 📁 System Architecture & Directory Layout

```
aiinfowaves/
├── client/                     # Frontend Project (Vite + React)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Brand logos, photography, illustrations
│   │   ├── components/
│   │   │   ├── layout/         # Layout wrapper, Navbar, Footer, ChatbotWidget
│   │   │   ├── ScrollToTop.jsx # Resets viewport position on page change
│   │   │   └── SessionGuard.jsx# Enforces 1-hour session limit
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── pages/              # 15 App Pages (documented below)
│   │   ├── styles/             # Global CSS and token systems
│   │   ├── utils/              # Client-side helper scripts
│   │   ├── App.jsx             # Main Router structure
│   │   └── main.jsx            # Entry point for ReactDOM
│   └── package.json
│
└── backend/                    # REST API Server (Node + Express)
    ├── config/                 # Passport and database environment files
    ├── controllers/            # Controller logic for endpoints
    ├── middleware/             # Route protection, file uploads, role checking
    ├── models/                 # Mongoose collection schemas
    ├── routes/                 # Express routing modules
    ├── services/               # Mailing and storage cloud handlers
    ├── server.js               # Application bootstrap and server initialization
    └── package.json
```

---

## 🖥️ Complete Page Directory

Below is the detail of all 15 screens/pages available in the client application:

### 1. Home Page (`HomePage.jsx`)
*   **Path:** `/`
*   **Description:** The landing portal of the company. It serves as the primary visual hook for visitors.
*   **Key Elements:**
    *   **Advanced Sci-Fi Core Animation:** A custom interactive element utilizing a central rotating SVG brain icon, multi-orbital rings rotating in opposite directions, and stepped PCB circuit traces with glowing energy packets traveling towards outer node points representing company capabilities.
    *   **Animated Counter:** Custom `AnimatedCounter` component displaying core business statistics (e.g., active consultants, success rate, client retention) that increments smoothly with an easing curve when scrolled into view.
    *   **Navigation & CTAs:** Provides immediate pathways to book sessions, request project collaborations, or explore scientific services.

### 2. Login Page (`LoginPage.jsx`)
*   **Path:** `/login`
*   **Description:** Secure authentication interface for registered clients and system administrators.
*   **Key Elements:**
    *   **Dual Sign-In:** Allows credential login (email and password with password strength visualization) and single-click authentication via **Google OAuth 2.0**.
    *   **State Management:** Stores JWT tokens inside browser local storage and initiates session logs upon login.

### 3. Register Page (`RegisterPage.jsx`)
*   **Path:** `/register`
*   **Description:** New user registration portal.
*   **Key Elements:**
    *   **Input Validation:** Validates form inputs (name, email, and password complexity) on the client side using standard React validation hooks.
    *   **Email Verification Trigger:** Redirects users to the verification phase upon successful submission of credentials.

### 4. Verify Email Page (`VerifyEmailPage.jsx`)
*   **Path:** `/verify-email`
*   **Description:** Page handling email validation codes.
*   **Key Elements:**
    *   Accepts verification links/tokens sent to the user's inbox to mark accounts as active and verified.

### 5. Forgot Password Page (`ForgotPasswordPage.jsx`)
*   **Path:** `/forgot-password`
*   **Description:** Password retrieval and account recovery workspace.
*   **Key Elements:**
    *   Allows input of a registered email address to receive password reset tokens, which are verified via secure Express mailers.

### 6. Google Callback Page (`GoogleCallbackPage.jsx`)
*   **Path:** `/auth/google/callback`
*   **Description:** Silent endpoint responsible for handling redirect tokens returned by Google authentication servers.
*   **Key Elements:**
    *   Extracts returned profile signatures and tokens, writes session states, and redirects authenticated users back to their target dashboards.

### 7. Next-Generation Sequencing Page (`NgsPage.jsx`)
*   **Path:** `/ngs`
*   **Description:** A service page showcasing AI-driven genomic bioinformatics analysis capabilities.
*   **Key Elements:**
    *   **Service Offerings:** Focuses on *Core Processing & Alignment*, *Variant Discovery (WGS & WES)*, *Expression Analysis (RNA-Seq)*, *Single-Cell Genomics (scRNA-Seq & scATAC-Seq)*, and *Microbiome Profiling*.
    *   **Pipeline Workflows:** Visualizes raw-to-processed genomics pathways (Raw Data Input $\rightarrow$ QC $\rightarrow$ Alignment $\rightarrow$ Variant Calling $\rightarrow$ Functional Analysis $\rightarrow$ Interactive Dashboards).
    *   **Bioinformatics Stack Details:** Lists integrated tools including STAR, GATK, HISAT2, Bowtie2, SAMtools, FastQC, Seurat, and QIIME2.

### 8. Proteomics Page (`ProteomicsPage.jsx`)
*   **Path:** `/proteomics`
*   **Description:** Specialized service showcase focusing on mass spectrometry and quantitative proteome analysis.
*   **Key Elements:**
    *   **Core Offerings:** Covers *Protein Identification*, *Quantitative Proteomics (TMT, SILAC)*, *Post-Translational Modifications (PTM Enrichment)*, *Protein-Protein Interactions*, and *Functional Pathway Enrichment*.
    *   **Bioinformatics Stack Details:** Displays compatibility with analytical systems like MaxQuant, Skyline, Mascot, MSFragger, Cytoscape, STRING, and Enrichr.

### 9. Services Page (`ServicesPage.jsx`)
*   **Path:** `/services`
*   **Description:** Unified overview page summarizing the primary consultancies and technical integrations offered by AI InfoWave.
*   **Key Elements:**
    *   Showcases detailed service cards for healthcare AI, precision agriculture analytics, digital transformation for small businesses, and enterprise AI education.

### 10. Booking Page (`BookingPage.jsx`)
*   **Path:** `/book`
*   **Description:** Interactive 3-step scheduling interface that enables users to book dedicated slots with AI consultants.
*   **Key Elements:**
    *   **Step 1 (Category Selection):** Selects between Bio & Health, Agriculture, Small Business, or Literacy Consultations.
    *   **Step 2 (Custom Calendar):** Features a customized monthly date picker calendar built directly in React (calculates first day index, day grid layouts, and disables past dates) coupled with specific timing slots (9:30 AM to 4:30 PM).
    *   **Step 3 (Client Form):** Collects client credentials, phone numbers, and detailed inquiry context, auto-populating fields for authenticated users.

### 11. Open Project Call Page (`OpenProjectCallPage.jsx`)
*   **Path:** `/open-project-call`
*   **Description:** "Open Innovation" channel enabling elite research groups to pitch advanced biological projects for AI compute support.
*   **Key Elements:**
    *   **Interactive Twinkling Network Canvas:** A background animation rendering floating nodes that bounce off margins, connect with elastic proximity lines, and dynamically attract/repel relative to the user's cursor positioning.
    *   **Secure Intake Form:** Details project descriptions, research areas (e.g. Next-Generation Sequencing, Proteomics, or custom models), institutional alignments, and project milestones.

### 12. Careers Page (`CareerPage.jsx`)
*   **Path:** `/career`
*   **Description:** The official talent acquisition page showcasing active job openings at AI InfoWave.
*   **Key Elements:**
    *   **Custom Atomic Canvas Animation:** Visualizes a high-fidelity atomic nucleus surrounded by orbiting electrons trailing customizable glow gradients, built on a HTML5 2D canvas draw loop.
    *   **Interactive Job Filters:** Allows filtering of positions by department (Bioinformatics, Engineering, Research, Data Science, Operations) with instant animation states.
    *   **Application Overlay Form:** Collects applicant details, references, and parses PDF resume uploads, forwarding them directly to backend controllers.

### 13. Internship Page (`InternshipPage.jsx`)
*   **Path:** `/internship`
*   **Description:** A dedicated dashboard detailing structured educational tracks for prospective student interns.
*   **Key Elements:**
    *   **Structured Curriculums:** Details six major 12-week tracks:
        1.  *Frontend Developer (Genomic Interfaces & React)*
        2.  *Backend Developer (High-Throughput APIs)*
        3.  *MERN Stack Developer (Full-Stack Labs & Platforms)*
        4.  *UI/UX Designer (Scientific Product Design)*
        5.  *AI/ML Intern (Predictive Biology & Deep Learning)*
        6.  *Data Analyst (Clinical Intelligence)*
    *   **Track Details:** Provides weekly phase objectives, technical stacks, required prerequisites, expected career paths, and sample projects.
    *   **Direct Application Portal:** Interactive multi-step form to apply for specific cohorts, including custom files upload.

### 14. Internship Admin Dashboard (`InternshipAdminPage.jsx`)
*   **Path:** `/admin/internships`
*   **Description:** Restricted portal designed for HR managers and system administrators.
*   **Key Elements:**
    *   **Application Counters:** Grid display of key metrics (Total Applications, Pending, Shortlisted, Rejected).
    *   **Query Controls:** Custom search query selectors (name/email lookup) and dropdown filters by Track Role or Application Status.
    *   **Status Management Actions:** Action headers allowing administrators to transition applicant statuses directly on-screen with backend updates and confirmation toast triggers.

### 15. Contact Page (`ContactPage.jsx`)
*   **Path:** `/contact`
*   **Description:** General support and consultation contact page.
*   **Key Elements:**
    *   Exposes clean input grids for names, emails, topics, and message logs. Forms validate requirements inline and submit records to the `ContactMessages` database.

---

## 🛡️ Core Utilities & Guards

*   **Session Guard (`SessionGuard.jsx`):** Employs a focus listener and route change tracker. It evaluates the user's active session timestamp and automatically signs them out if the session exceeds 1 hour.
*   **Scroll Reset (`ScrollToTop.jsx`):** Intercepts navigation actions to force browser windows to return to $(0,0)$ vertical coordinates, preventing content clipping upon transitions.
*   **Layout Wrapper (`Layout.jsx`):** Wraps standard routes with the global navigation header (which updates states depending on whether a user is logged in or an admin) and footer layout, while rendering the floating virtual assistant/chatbot widget.

---

## 🗄️ Database Schemas (MongoDB Atlas)

The system manages 6 primary collections defined as Mongoose models in `backend/models/`:

1.  **User (`User.js`):** Stores user account data, credentials (bcrypt hashed), providers (`local` vs. `google`), email verification status, and role-based access variables (`user` vs. `admin`).
2.  **Booking (`Booking.js`):** Logs selected services, scheduled dates, timing slots, and client contact context. Refers back to the `User` schema via a foreign key reference.
3.  **JobApplication (`JobApplication.js`):** Contains applicant details, targeted career IDs, text cover letters, and document URLs mapping to uploaded resumes.
4.  **InternshipApplication (`InternshipApplication.js`):** Manages cohort intakes, track configurations, current statuses (Pending, Shortlisted, Rejected), and uploaded resumes.
5.  **ProjectCall (`ProjectCall.js`):** Registers elite research specs, institutions, domains of interest (NGS, Proteomics, etc.), project summaries, and delivery timelines.
6.  **ContactMessage (`ContactMessage.js`):** Tracks incoming customer support messages and general inquiries.

---

## 📡 Backend REST API Endpoints

The server mounts endpoints under the `/api` prefix:

| Prefix | Route File | Purpose | Key Endpoints |
| :--- | :--- | :--- | :--- |
| `/api/auth` | `auth.js` | Authentications & OAuth | `POST /login`, `POST /register`, `POST /verify-email`, `GET /google` |
| `/api/bookings` | `booking.js` | Scheduling & Slots | `POST /create`, `GET /my-bookings` |
| `/api/internships` | `internships.js` | Internship Pipelines | `POST /apply`, `GET /` (Admin), `PUT /:id/status` (Admin) |
| `/api/jobs` | `jobs.js` | Career Applications | `POST /apply`, `GET /listings` |
| `/api/project-call`| `projectCall.js`| Project Spec Intake | `POST /submit` |
| `/api/contact` | `contact.js` | Contact forms | `POST /submit` |
| `/api/chat` | `chat.js` | Virtual support | `POST /message` |

---

## 💻 Installation & Setup

To launch the project locally, follow these steps:

### 1. Prerequisites
Install [Node.js](https://nodejs.org/) (v16+ recommended) and configure access to a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### 2. Environment Setup
Configure your environment variables inside configuration files for both components:

#### Backend Configuration (`backend/.env`)
Create a `.env` file under the `/backend` directory containing the following:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-infowave
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Google OAuth 2.0 Credentials (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Mailing Keys
RESEND_API_KEY=your_resend_api_key
```

#### Frontend Configuration (`client/.env.production` or configuration)
Verify backend connection strings inside `client/src/config.js` or configuration variables:
```javascript
export const API_BASE_URL = 'http://localhost:5000';
```

### 3. Execution Commands

#### Start Backend Server
```bash
cd backend
npm install
npm run dev     # Starts the development server via nodemon on http://localhost:5000
```

#### Start Client Server
```bash
cd client
npm install
npm run dev     # Starts the Vite development server on http://localhost:5173
```
