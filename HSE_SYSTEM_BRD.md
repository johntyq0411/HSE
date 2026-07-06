# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## HSE Incident & CAPA Compliance Portal

---

### Document Control

| Item | Specification Details |
| :--- | :--- |
| **Document Title** | Business Requirements Document (BRD) — Complete Site-Wide Functional & Technical Specifications |
| **Project Name** | DKSH HSE CAPA Production System |
| **System Version** | 1.1.0 (Production-Ready) |
| **Release Date** | July 5, 2026 |
| **Target Audience** | Executive Steering Committee, Regional HSE Directors, Software Engineering Teams, QA Teams |
| **Document Status** | **Approved for Implementation & Deployment** |

---

## 1. Executive Summary & Vision

### 1.1 Vision Statement
The **DKSH HSE Incident & CAPA Compliance Portal** is designed to digitize, standardize, and streamline the tracking of Health, Safety, and Environment (HSE) occurrences and the execution of Corrective and Preventive Actions (CAPA) across the entire Asia-Pacific region. By replacing fragmented manual spreadsheets, the portal serves as a single, unified source of truth for safety reporting, performance analytics, and regulatory compliance.

### 1.2 Strategic Goals
- **Empower Local Teams**: Enable site-level coordinators to easily report hazards, near-misses, and injuries through an interactive, intuitive multi-step wizard.
- **Drive Operational Accountability**: Structure the investigation phase using the industry-standard **5-Whys Root Cause Analysis** and track CAPA tickets from creation to verification.
- **Deliver Executive Transparency**: Render high-level regional indicators (LTIFR, TRIR, Severity Rate) on a visual dashboard to support data-driven safety decisions.
- **Enforce Corporate Governance**: Strictly apply Role-Based Access Control (RBAC) to segment market-specific records and prevent data tampering or leakage.

---

## 2. Core Architecture & System Landscape

The application is structured as an interactive, fully responsive full-stack single-page application built on **React 18+**, **Vite**, **TypeScript**, and **Tailwind CSS**. Data persistence is handled via a structured **Local Storage Hydration Engine** with fallback presets to simulate persistent databases in isolated sandboxed environments.

### 2.1 Context Flow & Component Map

```
                     +---------------------------------------+
                     |              src/App.tsx              |
                     |  - Central State: Reports, DCs, Hours |
                     |  - Role Switcher & SSO Simulator       |
                     +-------------------+-------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+------------------+           +------------------+            +------------------+
|  Dashboard.tsx   |           |  InspectionForm  |            |   TicketsLog.tsx |
|  - Regional View |           |  - Step 1: Info  |            |  - Search &      |
|  - Country View  |           |  - Step 2: Rosters|           |    Filter Panel  |
|  - Labor Hours   |           |  - Step 3: Body   |            |  - Detail Drawer |
|    Grid          |           |    Map & Classify|            |  - Action Panel  |
|  - Date Selector |           |  - Step 4: CAPA & |            +------------------+
+------------------+           |    5-Whys         |
                               +--------+---------+
                                        |
                                        v
                               +------------------+
                               |  HumanFigure.tsx |
                               |  - SVGAffected   |
                               |    Interactive   |
                               |    Anatomy       |
                               +------------------+
```

---

## 3. Role-Based Access Control (RBAC) Matrix

To secure corporate data, three distinct system roles are simulated. Each role dictates read, write, edit, and configuration capabilities across modules.

| Permission / Action | Reporter (Level 1) | Country HSE Manager (Level 2) | Superuser (Global Admin) |
| :--- | :--- | :--- | :--- |
| **Select Simulated Session** | Yes (restricted to default country) | Yes (restricted to default country) | Yes (access to all countries) |
| **View Regional Dashboard** | No (auto-redirected to Country view) | No (restricted to country context) | **Yes** (full regional consolidation) |
| **View Country Dashboard** | Yes (restricted to their default country) | Yes (restricted to their default country) | **Yes** (can toggle any country) |
| **Log Incident Reports (Tickets)** | **Yes** (creates and saves drafts) | **Yes** (full write permissions) | **Yes** (full write permissions) |
| **Conduct Investigation (Step 4)** | **No** (disabled in wizard) | **Yes** (full write & verification) | **Yes** (full write & verification) |
| **Edit Incident Drafts** | Yes (only their own drafts) | Yes (all drafts within their market) | **Yes** (unrestricted editing) |
| **Modify Labor Hours Grid** | **No** (view-only) | **Yes** (authorized market only) | **Yes** (unrestricted saving) |
| **Configure Masters (DCs)** | **No** (view-only UI) | **Yes** (can add/toggle local DCs) | **Yes** (full administrative master access) |
| **Extract Safety Data** | Redacted CSV format (no PII) | Full CSV/XLSX for local market | Full Regional CSV/XLSX & Executive PDF |

---

## 4. Module Specifications & Functional Workflows

### 4.1 Module 1: The SSO & Session Tester
- **Objective**: Simulates secure single sign-on corporate directories to demonstrate multi-market behavior on the fly.
- **Controls**:
  - **Role Select**: Choice between `Superuser`, `Level2`, and `Reporter`.
  - **Country Select**: Choice between `Malaysia`, `Thailand`, `Vietnam`, `Singapore`, and `Indonesia`.
- **Aesthetic Guidelines**: Styled as a neutral, modern "Role Test Environment" header in neutral slate tones (`#F4F4F4`), clearly indicating active simulated parameters.

---

### 4.2 Module 2: The HSE Performance Dashboard

The dashboard supports two display modes based on the active state:
1. **Regional Dashboard** (Consolidated view across all markets for Superusers)
2. **Country Dashboard** (Localized operational statistics with input forms)

#### 4.2.1 Advanced Date Range Picker
- Highly interactive calendar popover featuring a two-panel structure:
  - **Left Panel (Presets)**: Includes `Last 30 Days`, `Current Month`, `YTD`, `Last Year`, etc.
  - **Right Panel**: Responsive interactive grid to manually pick a continuous range of start and end dates. Handles responsive reflowing on mobile devices (`w-[92vw]`).

#### 4.2.2 Key Mathematical Performance Indicators (KPIs)
- **Safe Work Days**: Displayed as a metric block, representing consecutive calendar days since the last recorded **Lost Time Injury (LTI)**.
- **LTIFR Calculation**:
  $$\text{LTIFR} = \frac{\text{Total Lost Time Injuries (LTI Cases)} \times 1,000,000}{\text{Total Working Hours}}$$
- **TRIR Calculation**:
  $$\text{TRIR} = \frac{\text{Total Recordable Cases (LTI + MTC + FAC)} \times 1,000,000}{\text{Total Working Hours}}$$

#### 4.2.3 Interactive Labor Hours Configurator (Excel-Style Grid)
- **Grid Layout**: Monthly matrix dividing labor categories into **Employee Hours** and **Other/Contractor Hours**.
- **Calculations**: Sum totals are generated in real-time.
- **Lock & Save Security**: Input fields are strictly disabled for the `Reporter` role. `Level2` and `Superuser` roles can input numbers and click "Save & Unlock" to write directly to database state (simulated via LocalStorage).

---

### 4.3 Module 3: Step-by-Step Reporting Wizard (InspectionForm)

Designed as a structured multi-step wizard to guide users from initial notification to official closure.

```
+-------------------------------------------------------------------------------------------------+
|                                     INSPECTION FORM WIZARD                                      |
+---------------------+---------------------+---------------------+-------------------------------+
|    Step 1: Info     |   Step 2: Rosters   | Step 3: Body / Class|     Step 4: Root Cause (RW)    |
+---------------------+---------------------+---------------------+-------------------------------+
| - Date, Time, site  | - Add Personnel     | - Click body part   | - 5-Whys systematic checklist |
| - Choose category   | - Flag employee/sub | - Check 17-points   | - Action items & sign-off     |
| - CC notification   | - Injured / witness | - Select injuries   | - Verification & closure      |
+---------------------+---------------------+---------------------+-------------------------------+
```

#### Step 1: Basic Operational Data
- **Fields**: Date, Time, Category Select (`Injury`, `Ill-health`, `Property damaged`, `Near miss`, `Hazard Observation`), Location/Distribution Center, and CC Emails.
- **Behavior**: The location field displays a filtered list of only **active** Distribution Centers registered for the selected country.

#### Step 2: Involved Personnel & Witness Rosters
- Dynamic entry grid to add stakeholders into two tables:
  1. **Involved/Injured Personnel Table**: Captures Name, Staff ID, Department, Business Unit, Employee Status (Direct vs Contractor), Injury Flag (Injured vs Involved), and Location within the plant.
  2. **Witness Roster Records**: Captures Witness Name, Staff ID, Department, Business Unit, and Employment type.

#### Step 3: Injury Mapping & Classification Criteria
- **Interactive Body Map (HumanFigure)**:
  - Custom vector graphic representing human anatomy from front and back profiles.
  - Users can click on anatomical nodes (e.g., Head, Face, Eye, Shoulder, Hands, Finger, Knee, Feet) to toggle injury status.
  - Highlighted parts turn red to indicate an injury.
- **17-Point Classification Criteria Checklist**:
  - Complete checklist determining the severity of the event (e.g., results in death, recovery more than 6 months, absence more than 1 day with Lost Time Days input, medical treatment beyond first aid, significant injury, or simple first aid).
  - This systematic questionnaire automatically classifies the event severity (e.g., LTI, MTC, FAC, Near Miss) in the backend.

#### Step 4: Root Cause Analysis (CAPA & 5-Whys)
- **5-Whys Methodology Section**: Sequential input blocks to trace failure chains (Why did it happen? -> Direct Cause -> System Failure -> Ineffective Control -> Process Gap).
- **Corrective Actions**: Specific inputs for Immediate Corrective Actions and Long-Term Preventive Actions, along with Target Completion Dates.
- **Official Closure Verification**: Sign-off block specifying the verifier's identity, date, and final closing remarks. Updates the ticket status to `Closed`.

---

### 4.4 Module 4: My HSE Tickets Log & Search Engine
- **Objective**: Operational database explorer for managing open tickets, reviewing drafts, and updating records.
- **Key Features**:
  - **Text Search**: Real-time fuzzy filtering across titles, locations, owners, and descriptions.
  - **Status Pill Indicators**: Clear color coding representing ticket states:
    - `Draft` (Yellow - editable/resumable)
    - `Investigating` (Red - open under assessment)
    - `Closed` (Emerald - verified and resolved)
  - **Detailed Side Drawer**: Fully responsive sliding panel displaying the entire incident report, rosters, body mapping, 5-Whys, and investigation outcomes without reloading the page. Includes scrollable responsive tables for Involved/Witness rosters to prevent clipping on small displays.

---

### 4.5 Module 5: Masters Configuration (DC Config)
- **Objective**: Manage organizational units (Distribution Centers) dynamically.
- **Controls**:
  - **Site Registration**: Add Distribution Centers by specifying Name, Operating Country, and Assigned Manager.
  - **Activation Toggle**: Easily enable or disable sites. Inactive DCs are automatically hidden from the incident reporting wizard to prevent data entries for closed facilities.

---

## 5. Non-Functional Specifications & Design Standards

### 5.1 Corporate Brand & Color Palette
To align with the **DKSH Corporate Styling Guidelines**, the application utilizes a tailored slate-and-crimson high-contrast light theme:
- **Primary Color**: DKSH Crimson Red (`#D3121A`) — applied to main navigation accents, buttons, and alert states.
- **Secondary Color**: Corporate Charcoal Gray (`#1E293B`) — applied to headers, body text, and structural dividers.
- **Backgrounds**: Soft Warm Grays (`#F8FAFC`, `#F1F5F9`) to ensure visual comfort during long reporting shifts.

### 5.2 Responsive Layout Standards
- **Grid Structure**: Fluid standard desktop grids reflow into simple vertical containers on smaller screens.
- **Tables and Data Displays**: Scrollable horizontal containers (`overflow-x-auto`) wrapped around tables in involved rosters and witness records to ensure layout integrity on mobile devices.
- **Mobile Touch Elements**: Buttons, selection tabs, and dropdown menus maintain a minimum click area of 44px x 44px for warehouse operators using handheld devices.

---

## 6. Audit Logging & Security Compliance

- **Central Audit Record**: Each state modification (saving working hours, changing site configurations, submitting incident reports) triggers an internal record write containing the active coordinator's identifier and timestamp.
- **Data Protection Compliance**: Restricts local coordinators (`Reporter` role) from viewing other markets' safety data or accessing direct database tables.
- **PII Protection**: For basic exports or external summaries, sensitive personal information (such as personal medical logs or individual staff IDs) is automatically redacted and replaced with `[CONFIDENTIAL]` tags.

---

## 7. Operational Workflow Acceptance Matrix

To verify that the application complies with all business rules, it must pass the following scenarios:

```
+------------------+     +-------------------+     +------------------+     +------------------+
|    1. REPORT     | --> |  2. INVESTIGATE   | --> |   3. ACTION-ING  | --> |   4. VERIFICATION|
| User logs draft  |     | L2 role performs  |     | Assign CAPA items|     | Superuser signs  |
| or incident card |     | 5-Whys diagnostics|     | with target dates|     | off and closes   |
+------------------+     +-------------------+     +------------------+     +------------------+
```

1. **Wizard Draft Resume Flow**: A local reporter begins logging a ticket, enters rosters, and saves it as a `Draft` at Step 2. When they click "Edit" on the Tickets Log, the wizard successfully launches and resumes exactly at Step 2.
2. **5-Whys Safety Threshold Verification**: Attempting to close an incident classified as an Injury *without* completing the 5-Whys root cause analysis or assigning a Long-Term Preventive Action throws a validation error.
3. **Multi-Market Scope Isolation**: Logging in as Country HSE Manager (Level 2) of Vietnam restricts the Dashboard filter and Distribution Centers dropdown strictly to Vietnam. Changing the simulated SSO country dynamically updates the UI context instantly.
