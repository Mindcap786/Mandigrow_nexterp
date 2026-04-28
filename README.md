# MandiGrow SaaS — Multi-Tenant Distribution

Production-ready standalone monorepo containing both the customized ERP backend integration and UI features.

## Repository Topology
* `/backend`: Custom Frappe application logic and custom schemas.
* `/frontend`: Next.js deployment bundle.

## Deploying the Backend (Frappe)
1. Push standard configuration models to a fresh Frappe Bench setup.
2. Install dependent workflows:
   ```bash
   bench get-app mandigrow ./backend
   bench --site [your-site] install-app mandigrow
   bench migrate
   ```

## Deploying the Frontend (Next.js)
Ensure relevant URLs are updated appropriately.
