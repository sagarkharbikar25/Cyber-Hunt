# Cyber-Hunt — Operation Blackout: TechAlfa Vault

**A secure, interactive cyber-hunt platform built by Sagar Kharbikar & Ayush Roy.**

Cyber-Hunt is a web-based platform developed for **Operation Blackout**, designed to support cybersecurity challenges, team participation, hint management, proof submissions, and administrative verification.

The platform uses Next.js for the web application and Supabase for authentication and PostgreSQL database services.

## Features

- **Authentication:** User sign-in and access to the platform.
- **Challenge Dashboard:** Centralized interface for challenge fragments, hints, and proof submissions.
- **Terms of Engagement:** Rules and onboarding page for participants.
- **Proof Verification:** Administrative workflows for reviewing submissions.
- **Admin Portal:** Dedicated administrative login and submission management interfaces.
- **Database Integration:** Supabase-powered authentication and PostgreSQL data storage.
- **PDF Generation:** PDF export capabilities using jsPDF and jsPDF-AutoTable.

## Technology Stack

- **Frontend and application framework:** Next.js
- **Programming language:** JavaScript
- **Backend services and database:** Supabase, PostgreSQL
- **Authentication:** Supabase Auth and application-level authentication configuration
- **PDF generation:** jsPDF, jsPDF-AutoTable
- **Package management:** npm

## Application Routes

| Route                | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `/`                  | Main landing and login page                                       |
| `/rules`             | Terms of Engagement and onboarding                                |
| `/dashboard`         | Participant dashboard for hints, fragments, and proof submissions |
| `/admin/login`       | Administrative login                                              |
| `/admin/submissions` | Submission review and volunteer control interface                 |

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js (LTS recommended)
- npm
- A Supabase project with the required database and authentication configuration

### 1. Clone the repository

```bash
git clone https://github.com/sagarkharbikar25/Cyber-Hunt.git
cd Cyber-Hunt
```

### 2. Install dependencies

```bash
npm install
npm install @supabase/supabase-js jspdf jspdf-autotable
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
NEXTAUTH_SECRET=your_random_secret
RESEND_API_KEY=your_resend_api_key
ADMIN_SECRET=your_admin_secret
```

Replace the placeholders with your own environment-specific values.

**Security requirements:**

- Never commit `.env.local` or other secret files.
- Keep service-role keys, authentication secrets, email API keys, and admin secrets server-side.
- Use environment variables in deployment settings rather than hardcoding credentials.
- Ensure that Supabase Row Level Security (RLS) policies protect sensitive database records.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm run start
```

## Demo Test Accounts

The following accounts are intended for demonstration and testing, subject to the repository's configured authentication and seeded user records.

| Account | Email                 | Test Passcode  |
| ------- | --------------------- | -------------- |
| Alpha   | `test@example.com`    | `TEST-ALPHA`   |
| Beta    | `beta@example.com`    | `TEST-BETA`    |
| Gamma   | `gamma@example.com`   | `TEST-GAMMA`   |
| Delta   | `delta@example.com`   | `TEST-DELTA`   |
| Epsilon | `epsilon@example.com` | `TEST-EPSILON` |
| Zeta    | `zeta@example.com`    | `TEST-ZETA`    |
| Eta     | `eta@example.com`     | `TEST-ETA`     |
| Theta   | `theta@example.com`   | `TEST-THETA`   |
| Iota    | `iota@example.com`    | `TEST-IOTA`    |
| Kappa   | `kappa@example.com`   | `TEST-KAPPA`   |

**Note:** These are demonstration credentials, not production accounts. Their availability depends on the authentication setup and whether the corresponding test users have been provisioned. Do not use real personal credentials or privileged production accounts as public demo accounts.

## Learning Outcomes

Developing Cyber-Hunt provided practical experience with:

- Building web applications using Next.js and JavaScript.
- Integrating a web application with Supabase and PostgreSQL.
- Configuring environment variables and external services.
- Organizing application routes and user-facing workflows.
- Implementing challenge submission and administrative review workflows.
- Integrating PDF-generation libraries.
- Understanding authentication, access control, and secure configuration practices.

## Future Improvements

Potential areas for further development include:

- Automated testing and continuous integration.
- More granular role-based access control.
- Enhanced audit logging and submission tracking.
- Improved accessibility and responsive design.
- Additional security testing and performance optimization.

## Contributing

Contributions, suggestions, and bug reports are welcome. Please open an issue to discuss significant changes before submitting a pull request.

## Project

**Project:** Cyber-Hunt — Operation Blackout: TechAlfa Vault
**Repository:** [Cyber-Hunt on GitHub](https://github.com/sagarkharbikar25/Cyber-Hunt.git)
**Team:** TechAlfa

---

*Built to create a structured, engaging, and collaborative cybersecurity challenge experience.*
