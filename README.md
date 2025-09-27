# NexaFlow - Project Management System

A comprehensive project management system with role-based workflow automation.

## Features

- **Complete Project Workflow**: Client requests → Admin review → PM assignment → Task breakdown → Team execution → Client approval
- **Role-Based Access Control**: Admin, Project Manager, Team Member, and Client roles with distinct permissions
- **Real-time Notifications**: Live updates and status changes throughout the project lifecycle
- **Interactive Dashboard**: Role-specific dashboards with relevant metrics and actions
- **Task Management**: Break down projects into tasks and track progress
- **Dual Completion Approval**: Both PM and Client must approve project completion

## Quick Setup (Demo Mode)

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 and login with demo accounts:
   - **Client**: `client@techcorp.com` / `demo123`
   - **Admin**: `admin@nexaflow.com` / `demo123`
   - **Project Manager**: `pm@nexaflow.com` / `demo123`
   - **Team Member**: `designer@nexaflow.com` / `demo123`

## Full Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the SQL commands from `database.sql` in your Supabase SQL editor
5. Enable Row Level Security policies
6. Create user accounts through the authentication system

## Workflow Demo

### For Jury Demonstration:

1. **Client submits request**: Login as client and create a new project request
2. **Admin reviews**: Login as admin to approve/reject and assign to PM  
3. **PM breaks down work**: Login as PM to create tasks and assign to team members
4. **Team executes**: Login as team member to complete assigned tasks
5. **PM reviews**: PM reviews completed tasks and sends to client
6. **Client approves**: Client reviews and marks project complete
7. **Dual completion**: Both PM and client must confirm completion

### Key Workflow Features:

- **Status Tracking**: Projects move through defined states (pending → admin_review → approved → in_progress → pm_review → client_review → completed)
- **Activity Logging**: All actions are tracked and logged for audit trail
- **Notification System**: Real-time alerts for status changes and assignments
- **Confirmation Dialogs**: Important actions require user confirmation
- **Role Validation**: Each action validates user permissions

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and stats components  
│   ├── Layout/         # Header, sidebar, layout components
│   ├── Projects/       # Project cards and details
│   └── Analytics/      # Analytics and reporting
├── context/
│   └── AuthContext.tsx # Authentication and user management
├── hooks/
│   └── useProjects.ts  # Project and task data management
├── lib/
│   └── supabase.ts     # Database configuration and functions
└── types/              # TypeScript type definitions
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## Database Schema

- **users**: User profiles with role-based permissions
- **projects**: Project information and status tracking
- **tasks**: Task breakdown and assignment
- **project_activities**: Audit trail and activity logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with all user roles
5. Submit a pull request

## License

MIT License - see LICENSE file for details