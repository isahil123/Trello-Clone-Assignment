# Trello Clone (SDE Intern Fullstack Assignment)

A fully functional, Kanban-style project management web application that closely replicates Trello's design and user experience. Built with React (Vite) and Node.js (Express) using Prisma ORM and **PostgreSQL** as the primary database.

## Features Included

**1. Board Management**

- [x] Create a board with a title (from the Dashboard view)
- [x] View board with all its lists and cards

**2. Lists Management**

- [x] Create lists inside a board
- [x] Edit list titles inline (click to edit)
- [x] Delete lists (via the `...` actions menu)
- [x] Drag and drop to reorder lists horizontally

**3. Cards Management**

- [x] Create cards with a title inside any list
- [x] Edit card title and description (via Card details modal)
- [x] Archive / Delete cards (via Card details modal "Archive" action)
- [x] Drag and drop cards between different lists
- [x] Drag and drop to reorder cards within the same list

**4. Card Details (Modal)**

- [x] Add and remove labels (colored tags mapping to Trello's exact color scheme)
- [x] Set due date on cards
- [x] Add checklist with items (mark items as complete/incomplete)
- [x] Assign members to cards from available seeded members

**5. Search & Filter**

- [x] Global search by card or board title in the top navigation bar
- [x] Filter cards on a board by keyword, labels, members, and due dates (via the Filter button in the board header)

**Bonus Features (Good to Have)**

- [x] Fully responsive design (mobile hamburger menu, full-width modals, responsive grid)
- [x] Multiple boards support (Dashboard displays all created boards)
- [x] Comments and activity log on cards (add comments to cards)
- [x] Dark mode Trello-accurate UI styling (exact hex colors and hover states)

## Tech Stack

- **Frontend:** React 18, React Router, `@hello-pangea/dnd` (for smooth drag and drop), Vanilla CSS for styling (Trello UI clone)
- **Backend:** Node.js, Express.js
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Development Server:** Vite

## Database Schema Highlights

The database is built using Prisma and features a heavily relational schema:

- **User:** Contains standard user info. Assumes a default seeded user is logged in.
- **Board:** Has many `List`, `Label`, and `BoardMember` entries.
- **List:** Belongs to a Board, has many `Card` entries. Maintains a `position` float to handle reordering efficiently.
- **Card:** Belongs to a List. Contains its own `position`, `dueDate`, and relations to `CardLabel`, `CardMember`, `Checklist`, and `Comment`.
- **Checklist & ChecklistItem:** Nested tracking of sub-tasks.
- _(Detailed schema available in `backend/prisma/schema.prisma`)_

## Setup Instructions

### Prerequisites

- Node.js (v18+)

### 1. Database Setup

1. Ensure you have a running PostgreSQL instance (local or cloud like Neon/Supabase).
2. Configure your connection string in `backend/.env`:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```
3. Prisma will connect to this database to push the schema in the next step.

### 2. Backend Setup

```bash
cd backend
npm install

# Run database schema push and apply schema
npx prisma db push

# Seed the database with sample users, boards, lists, and cards
npm run seed

# Start the development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

## Assumptions Made

1. **Authentication:** The assignment stated "No Login Required: Assume a default user is logged in." The backend treats all requests as coming from a default seeded user (`user-1`), and features like "Assign Member" and "Add Comment" associate the action with this user or other seeded mock users.
2. **Drag & Drop Reordering:** Reordering uses fractional positioning (a `position` float column). When an item is dragged between two others, its new position is calculated as the average of the two adjacent positions.
3. **Card Archiving:** Clicking "Archive" on a card currently triggers a hard delete in the API to fulfill the requirement "Delete or archive cards".
4. **UI Colors:** To match Trello's modern feel, the app defaults to Trello's dark mode aesthetic with matching color tokens (`#22272b` for cards, `#101204` for lists).
