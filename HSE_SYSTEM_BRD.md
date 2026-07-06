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
                     |  - Active User Role & Market Context  |
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

To secure corporate data, four distinct system roles are supported. Each role dictates read, write, edit, and configuration capabilities across modules.

| Permission / Action | Reporter (Level 1) | Country HSE Manager (Level 2) | Regional HSE Manager | Superuser (Global Admin) |
| :--- | :--- | :--- | :--- | :--- |
| **View Regional Dashboard** | No (auto-redirected to Country view) | No (restricted to country context) | **Yes** (full regional consolidation) | **Yes** (full global consolidation) |
| **View Country Dashboard** | Yes (restricted to their default country) | Yes (restricted to their default country) | **Yes** (can toggle any regional country) | **Yes** (can toggle any country globally) |
| **Log Incident Reports (Tickets)** | **Yes** (creates and saves drafts) | **Yes** (full write permissions) | **Yes** (full write permissions) | **Yes** (full write permissions) |
| **Conduct Investigation (Step 4)** | **No** (disabled in wizard) | **Yes** (full write & verification) | **Yes** (full write & verification) | **Yes** (full write & verification) |
| **Edit Incident Drafts** | Yes (only their own drafts) | Yes (all drafts within their market) | **Yes** (all drafts in their region) | **Yes** (unrestricted editing) |
| **Modify Labor Hours Grid** | **No** (view-only) | **Yes** (authorized market only) | **Yes** (authorized region markets) | **Yes** (unrestricted saving) |
| **Configure Masters (DCs)** | **No** (view-only UI) | **No** (view-only configuration lists / restricted) | **Yes** (full regional master DC configuration access) | **Yes** (full administrative master access) |
| **Extract Safety Data** | Redacted CSV format (no PII) | Full CSV/XLSX for local market | **Yes** (Full Regional CSV & PDF Summaries) | **Yes** (Full Regional CSV/XLSX & executive PDF) |

---

## 4. Module Specifications & Functional Workflows

### 4.1 Module 1: The HSE Performance Dashboard

The dashboard supports two display modes based on the active state:
1. **Regional Dashboard** (Consolidated view across all markets for Superusers)
2. **Country Dashboard** (Localized operational statistics with input forms)

#### 4.2.1 Advanced Date Range Picker
- Highly interactive calendar popover featuring a two-panel structure:
  - **Left Panel (Presets)**: Includes `Last 30 Days`, `Current Month`, `YTD`, `Last Year`, etc.
  - **Right Panel**: Responsive interactive grid to manually pick a continuous range of start and end dates. Handles responsive reflowing on mobile devices (`w-[92vw]`).

#### 4.2.2 Key Mathematical Performance Indicators (KPIs)
- **Safe Work Days**: Represented as a dynamic indicator displaying consecutive days without any Lost Time Injury (LTI) occurrences.
- **Corporate Standard Frequency Rate**: The portal normalizes incident frequency rates per **1,000,000 hours worked**:
  $$\text{Standard Rate} = \frac{\text{Total Incident Cases of a Specific Type} \times 1,000,000}{\text{Total Labor Hours Worked}}$$

- **Standardized Calculations List**:
  1. **Fatalities Rate (DEATH)**:
     $$\text{DEATH Rate} = \frac{\text{Total Fatalities (No.7)} \times 1,000,000}{\text{Total Labor Hours Worked}}$$
  2. **High Consequence Work-Related Injury Rate (>6M)**:
     $$\text{>6M Rate} = \frac{\text{Total High-Consequence Work-Related Injuries (No.8)} \times 1,000,000}{\text{Total Labor Hours Worked}}$$
  3. **Lost Time Injury Rate (LTI)**:
     $$\text{LTI Rate} = \frac{\text{Total Lost Time Injuries (No.9)} \times 1,000,000}{\text{Total Labor Hours Worked}}$$
  4. **Recordable Injury Rate (REC)**:
     $$\text{REC Rate} = \frac{\text{Total Recordable Work-Related Injuries (No.8-13)} \times 1,000,000}{\text{Total Labor Hours Worked}}$$
  5. **Work-Related Injury Rate (WRI)**:
     $$\text{WRI Rate} = \frac{\text{Total Work-Related Injuries (No.8-14)} \times 1,000,000}{\text{Total Labor Hours Worked}}$$
  6. **Property Damage Case Count (PD)**: Absolute count of property damage incidents (No.15).
  7. **Near Misses Case Count (NM)**: Absolute count of near-miss occurrences (No.16).
  8. **Hazard Observation Case Count (HZ)**: Absolute count of hazard observations (No.17).

#### 4.2.3 Interactive Labor Hours Configurator (Excel-Style Grid)
- **Grid Layout**: Monthly matrix dividing labor categories into **Employee Hours** and **Other/Contractor Hours**.
- **Calculations**: Sum totals are generated in real-time.
- **Lock & Save Security**: Input fields are strictly disabled for the `Reporter` role. `Level2` and `Superuser` roles can input numbers and click "Save & Unlock" to write directly to database state (simulated via LocalStorage).

#### Fields involved in Module 1:
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Date Range Picker Presets** | Button Selection Group | No | Quick selector options (e.g., `Last 30 Days`, `Current Month`, `YTD`, `Last Year`). |
| 2 | **Custom Start Date** | Calendar Date Picker | Yes (if Custom selected) | Beginning boundary date for safety KPI analytics. |
| 3 | **Custom End Date** | Calendar Date Picker | Yes (if Custom selected) | Ending boundary date for safety KPI analytics. |
| 4 | **Dashboard Country Filter** | Dropdown Selector | Yes (for admin/regional) | Filters safety visualizers/metrics to the selected market. Locked to local context for standard users. |
| 5 | **Labor Year Selector** | Dropdown Selector | Yes | Selects target calendar year for hours entry (e.g. 2026). |
| 6 | **Labor Month Selector** | Dropdown Selector | Yes | Selects target calendar month for hours entry. |
| 7 | **Employee Hours** | Numeric Input | Yes | Sum of direct employee exposure hours worked. Supports decimals. |
| 8 | **Contractor / Other Hours** | Numeric Input | Yes | Sum of external contractor/subcontractor exposure hours. Supports decimals. |

---

### 4.2 Module 2: Step-by-Step Reporting Wizard (InspectionForm)

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

#### Fields involved in Step 1 (Basic Info):
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Reporting Date** | Calendar Date Picker | Yes | The date when the safety occurrence took place (past or current date). |
| 2 | **Reporting Time** | Time Input (HH:MM) | Yes | The clock time of the safety occurrence. |
| 3 | **Incident Category** | Dropdown Selector | Yes | Choice of: `Injury`, `Ill-health`, `Property damaged`, `Near miss`, `Hazard Observation`. |
| 4 | **Distribution Center / Site** | Dropdown Selector | Yes | Active registered DC/facility. Filtered dynamically based on active country context. |
| 5 | **CC Notification Emails** | Text Area / Email list | No | Semi-colon separated list of stakeholder email addresses to auto-notify. |

#### Step 2: Involved Personnel & Witness Rosters
- Dynamic entry grid to add stakeholders into two tables:
  1. **Involved/Injured Personnel Table**: Captures Name, Staff ID, Department, Business Unit, Employee Status (Direct vs Contractor), Injury Flag (Injured vs Involved), and Location within the plant.
  2. **Witness Roster Records**: Captures Witness Name, Staff ID, Department, Business Unit, and Employment type.

#### Fields involved in Step 2 (Rosters):
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Involved Person Name** | Text Input | Yes (if row added) | Full name of the involved, witness, or injured worker. |
| 2 | **Involved Staff ID** | Alphanumeric Text | Yes (if row added) | Employee system identifier or contractor badge number. |
| 3 | **Involved Department** | Text Input | Yes (if row added) | Standard operations department of the worker. |
| 4 | **Involved Business Unit** | Dropdown Selector | Yes (if row added) | Operating commercial BU of the worker. |
| 5 | **Involved Employee Status** | Dropdown Selector | Yes (if row added) | Choices: `Direct Employee` or `Contractor`. |
| 6 | **Involved Injury Designation**| Dropdown Selector | Yes (if row added) | Choices: `Injured` (undergoes body mapping) or `Involved`. |
| 7 | **Specific Location** | Text Input | No | Precise location of the worker at the time of incident. |
| 8 | **Witness Name** | Text Input | Yes (if witness added) | Full name of the eye witness. |
| 9 | **Witness Staff ID** | Alphanumeric Text | No | System ID of the witness. |
| 10 | **Witness Department** | Text Input | No | Operations department of the witness. |
| 11 | **Witness Business Unit** | Dropdown Selector | No | Business unit of the witness. |
| 12 | **Witness Employee Status** | Dropdown Selector | No | Choices: `Direct Employee` or `Contractor`. |

#### Step 3: Injury Mapping & Classification Criteria
- **Interactive Body Map (HumanFigure)**:
  - Custom vector graphic representing human anatomy from front and back profiles.
  - Users can click on anatomical nodes (e.g., Head, Face, Eye, Shoulder, Hands, Finger, Knee, Feet) to toggle injury status.
  - Highlighted parts turn red with a pulsing radar ring to indicate an injury.
  - **Mobile-Specific Touch-First UX Refactor (max-width: 767px)**:
    - **Decluttered UI**: Left/right side textual indicators and the standard checkbox lists are completely hidden (`display: none;`) to maximize vertical breathing space and isolate the interactive graphic.
    - **Centered Diagram**: The central anatomical illustration is isolated, centered (`margin: 0 auto;`), and scaled cleanly to standard mobile viewports (`width: 100%; max-width: 350px;`) without horizontal scrolling.
    - **Expanded Touch Targets**: Invisible overlay hit circles of at least `44px x 44px` are configured for all hotspots to eliminate frustrating mis-taps on small touchscreens.
    - **Boundary-Aware Tooltips**: Tooltips adapt dynamically to coordinate locations. High hotspots (like the Head) render tooltips below the node rather than above, and extreme edge hotspots use horizontal offset shifts to completely eliminate text clipping or overflow against container boundaries.
    - **Persistent Selection Summary (Chip List)**: A wrap-aligned flexbox chip list (`display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 48px;`) displays active selections as visual pills (e.g. `[ Knee ✕ ]`). Tapping the '✕' on a chip immediately removes it from the selection list and turns off the corresponding active radar dot on the body graphic.
- **17-Point Classification Criteria Checklist**:
  - Complete checklist determining the severity of the event (e.g., results in death, recovery more than 6 months, absence more than 1 day with Lost Time Days input, medical treatment beyond first aid, significant injury, or simple first aid).
  - This systematic questionnaire automatically classifies the event severity (e.g., LTI, MTC, FAC, Near Miss) in the backend.

#### Fields involved in Step 3 (Mapping & Classification):
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Anatomical Body Parts** | Interactive Vector Area | No | Click hotspots (e.g. Head, Face, Eyes, Arm, Hand, Leg, Feet) to log injured physical locations. |
| 2 | **17-Point Criteria Checklist**| Interactive Checkboxes | Yes | Multiple-choice checkboxes mapping to severity classification standards. |
| 3 | **Lost Time Days** | Numeric Input | Yes (if LTI is triggered) | Calculated total work shifts lost due to injury. Mandatory only when LTI or recovery period criteria is flagged. |

#### Step 4: Root Cause Analysis, Actions & Sign-off (HSE Managers & Superusers Only)
- **Role Restrictions**: Level 1 Reporters are strictly restricted from visiting or submitting Step 4. Instead, their wizard consists of 3 steps, and they sign their Personal Data Protection Act (PDPA) Consent and submit their Incident Report directly at the bottom of **Step 3**.
- **5-Whys Methodology Section**: Sequential input blocks to trace failure chains (Why did it happen? -> Direct Cause -> System Failure -> Ineffective Control -> Process Gap).
- **Corrective Actions**: Specific inputs for Immediate Corrective Actions and Long-Term Preventive Actions, along with Target Completion Dates.
- **Official Closure Verification**: Sign-off block specifying the verifier's identity, date, and final closing remarks. Updates the ticket status to `Closed`.
- **Personal Data Protection Act (PDPA) Consent**:
  - For Reporters: Displayed at the bottom of Step 3 prior to final submission.
  - For HSE Managers & Superusers: Displayed at the bottom of Step 4 prior to investigation closeout.
  - Ensures compliance with personal data collection and processing policies within DKSH.
  - **Dim and Lock Control**: If the PDPA consent checkbox is not checked, the final submission action button is visually dimmed and locked (disabled) to enforce data privacy compliance before any data can be saved.

#### Fields involved in Step 4 (CAPA, Consent & Investigation):
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Why 1: Direct Incident Cause**| Text Input / Text Area | Yes | Initial event description trigger. |
| 2 | **Why 2: Physical/Technical** | Text Input / Text Area | Yes | Mechanical, spatial, or physical fail-point. |
| 3 | **Why 3: Human Action / Factor**| Text Input / Text Area | Yes | Unsafe acts or process compliance issues. |
| 4 | **Why 4: Management/Process** | Text Input / Text Area | Yes | Process guidelines, checklists, or workflow gap. |
| 5 | **Why 5: Systemic Root Cause** | Text Input / Text Area | Yes | Ultimate organizational culture or resourcing gap. |
| 6 | **Immediate Corrective Action** | Text Area | Yes | Measures taken within 24 hours to contain hazard. |
| 7 | **Long-Term Preventive Action**| Text Area | Yes | Permanent process changes to prevent recurrences. |
| 8 | **Action Owner** | Text Input | Yes | Assigned supervisor responsible for implementing CAPA. |
| 9 | **Target Due Date** | Calendar Date Picker | Yes | Expected completion date for actions. |
| 10 | **Sign-off Verifier Name** | Text Input | Yes (on closure) | Lead manager validating closure (only for Level 2/3/Admin). |
| 11 | **Sign-off Closure Date** | Calendar Date Picker | Yes (on closure) | Verified closeout date. |
| 12 | **Final Closing Comments** | Text Area | Yes (on closure) | Comprehensive verification notes and checklist confirmation. |
| 13 | **PDPA Consent Checkbox** | Checkbox Selector | Yes | Consent to the processing of personal data for HSE Incident Reporting inside DKSH. Mandatory for all roles before submitting. |

---

### 4.3 Module 3: My HSE Tickets Log & Search Engine
- **Objective**: Operational database explorer for managing open tickets, reviewing drafts, and updating records.
- **Key Features**:
  - **Text Search**: Real-time fuzzy filtering across titles, locations, owners, and descriptions.
  - **Status Pill Indicators**: Clear color coding representing ticket states:
    - `Draft` (Yellow - editable/resumable)
    - `Investigating` (Red - open under assessment)
    - `Closed` (Emerald - verified and resolved)
  - **Detailed Side Drawer**: Fully responsive sliding panel displaying the entire incident report, rosters, body mapping, 5-Whys, and investigation outcomes without reloading the page. Includes scrollable responsive tables for Involved/Witness rosters to prevent clipping on small displays.

#### Fields involved in Module 3:
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Search Filter Box** | Text Search Input | No | Real-time text filter covering descriptions, location, names, and ticket identifiers. |
| 2 | **Status Filter Tabs** | Multi-Select Group | No | Filter records selectively based on `Draft`, `Investigating`, or `Closed`. |
| 3 | **Classification Quick Filters**| Toggle / Checkbox Group | No | Filter records by `Injury`, `Ill-health`, `Property damaged`, `Near miss`, `Hazard`. |

---

### 4.4 Module 4: Masters Configuration (DC Config)
- **Objective**: Manage organizational units (Distribution Centers) dynamically.
- **Controls**:
  - **Site Registration**: Add Distribution Centers by specifying Name, Operating Country, and Assigned Manager. (Restricted to Regional HSE Manager / Superuser only).
  - **Activation Toggle**: Easily enable or disable sites. Inactive DCs are automatically hidden from the incident reporting wizard. (Restricted to Regional HSE Manager / Superuser only).
  - **Role Restrictions**: Country HSE Managers (Level 2) and standard Reporters (Level 1) are strictly restricted to read-only views of the Distribution Center lists and are blocked from registering new facilities or toggling statuses.

#### Fields involved in Module 4:
| No. | Field Name | Field Type | Mandatory | Description / Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **DC / Site Name** | Text Input | Yes | Full human-readable name of the facility/Distribution Center. |
| 2 | **Operating Country / Market**| Dropdown Selector | Yes | Target country context to assign the newly created site. |
| 3 | **Assigned Plant Manager** | Text Input | Yes | Designate the manager in charge of facility HSE compliance. |
| 4 | **DC Status Toggle** | Switch / Slider Checkbox| Yes | Active state of the DC. Non-active facilities are hidden from standard reporting drop-downs. |

---

## 5. Non-Functional Specifications & Design Standards

### 5.1 Corporate Brand & Color Palette
To align with the official **DKSH Corporate Styling Guidelines**, the application strictly employs the certified color palette and typography system:
- **Primary Color**: DKSH Crimson Red (`#BE0028`) — the cornerstone color applied to corporate headers, branding, and status anchors.
- **Secondary Accent**: Active Red (`#EF233C`) — high-visibility pure red reserved strictly for primary Call-to-Actions (CTAs) and interactive elements.
- **Core Neutrals**: Corporate Dark Gray (`#1A1A1A`) for headers and readable body text, and White (`#FFFFFF`) for card backgrounds.
- **Background Palette**: Soft Warm Grays (`#F4F4F4`, `#F8FAFC`) to prevent fatigue during long operational reporting shifts.
- **Digital Accents**: Light Blue (`#90E0EF`), Medium Blue (`#00B4D8`), and Blue (`#0077B6`) applied as interactive hovers and state highlights.
- **Typography Stack**: Standard digital font pairing: `"Noto Sans", "Arial", sans-serif` to ensure high accessibility, universal language support, and clean contrast.

### 5.2 Responsive Layout Standards & Mobile-First Architecture
- **Global Restraints**: All elements strictly enforce `box-sizing: border-box;` and parent container constraints. The main viewport wrapper restricts width to `100%` with `overflow-x: hidden` to eliminate horizontal page scrolling on all mobile platforms.
- **Edge-to-Edge Root**: Under 768px viewports, the outermost root container, body, and app wrapper fully collapse horizontal padding and margins (`padding-inline: 0; margin-inline: 0;`) to capture every pixel of horizontal space.
- **Full-Width Grey Wrapper**: The grey background container (`#F4F4F4`) stretches completely edge-to-edge on mobile with a flexible `width: 100%` and zero border-radius.
- **Optimized Mobile Spacing**: Inside the grey background container, outer margin spacers are reduced to a strict maximum of `8px` to `12px` via a unified `.global-form-container` wrapper to maximize available data entry width.
- **Refined Internal Card Padding**: All form cards utilize the `.global-form-card` component. On mobile viewports, the internal horizontal padding is tightened to a precise `12px` (down from `32px` on desktop) so that multi-column input fields (e.g., Witness Name, Roster grids, and Department) can stretch wider for maximum readability and easier tap-input interaction.
- **Tablet & Desktop Preservation**: Standard maximum-width rules are preserved for larger screens via media queries. On tablet screens, the form cards center beautifully with a maximum width of `600px` (`margin: 0 auto`) to maintain a clean, balanced look.
- **Desktop Grid Expansion**: On desktop screens (`min-width: 1024px`), the main layout container expands dynamically to a full-screen optimized `max-width: 1440px` with a side-by-side flex layout. The "HSE Incident Record" form card expands fluidly (`flex: 1`) to fill the left-hand column while the "Active Drafts Catalog" anchors to a clean right-hand sidebar (`width: 320px`).
- **Multi-Column Fields Expansion**: On desktop viewports, cramped form fields (e.g. A. Name, B. Staff ID, C. Department) inside the "Details of Person Injured" card automatically convert into a multi-column responsive grid layout (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px`) to utilize desktop width efficiently.
- **Progressive Stepper Disclosure**: Under 768px viewports, step text labels are selectively hidden for inactive stages via progressive disclosure, preserving only the active step's label. The step navigation buttons are evenly distributed in a flex layout, and a custom connecting line is locked at `top-[18px]` to perfectly bisect the circular icons regardless of varying button heights.
- **Corporate Logo Aspect Ratio Enforcement**: The DKSH brand logo is styled with strict `object-fit: contain` and height locked to `32px` with a fluid auto-width, completely preventing horizontal and vertical distortion. It is centered vertically inside a flexible padded container that preserves brand clear-space guidelines.
- **"One-Thumb" Navigation**: A fixed bottom navigation bar is active on mobile viewports (< 768px) to allow effortless single-hand transitions between the Regional Dashboard, Country Dashboard, Incident Ticket logs, Wizard reporting forms, and Masters configuration screens.
- **Collapsible Filter Consolidation**: Top-level environment filter selectors (Role, Market, Date Range, Category) are condensed into a high-contrast collapsible accordion panel, saving up to 250px of vertical screen real estate for direct data visibility.
- **Vertical Stacking & Desktop Ribbon Layout**: The "Labor Hours Entry" section automatically reflows from multi-column rows into clean vertical column stacks on mobile screens (< 768px) to optimize input ergonomics. On desktop screens (>= 1024px), it transforms into an ultra-compact single-row "ribbon" layout using horizontal flex row alignment (`flex-direction: row; align-items: flex-end; gap: 24px;`) with compressed numeric input widths (maximum 130px to 140px) to minimize vertical footprint and maximize high-density dashboard real estate.
- **Desktop Body Parts Area Rebalance & Wrap**: For the "Body Parts Affected" section on desktop viewports (>= 1024px), the top-level parent wrapper implements a balanced grid layout (`grid-template-columns: 280px 1fr; gap: 32px;`) that separates the scrollable List Checklist (locked at `280px` width) from the fluid Diagram Area to maximize screen utilization. Inside, the instruction text ("FORM MODE: CLICK DIAGRAM FIELDS...") is styled to wrap cleanly (`white-space: normal; overflow-wrap: break-word; word-wrap: break-word;`) to prevent text-bleed outside its container. The side indicators lists (Left and Right Side Indicators) are fully constrained within the frame through a tight `16px` grid column gap, a streamlined central graphic width (`240px` width, `480px` height), item padding reduction, and text-wrapping overrides (`white-space: normal !important`) to eliminate any horizontal overflow or out-of-frame bleed.
- **Accessible Touch Targets**: All interactive controls, inputs, dropdown selectors, list toggles, and buttons maintain a minimum height of **48px** on mobile viewports to comply with standard accessibility and touch-target guidelines.
- **Symmetric 2x2 Grid Stats**: Key metrics blocks (Total, Investigating, Closed, and Draft counters) are refactored into a balanced `2x2` CSS grid container on mobile screens, preventing horizontal clipping while maximizing screen density.
- **Tables and Data Displays**: Scrollable horizontal containers (`overflow-x-auto`) are wrapped around dense data grids (such as Involved Rosters and Witness Records) to ensure readability on small displays.

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
3. **Multi-Market Scope Isolation**: Logging in as Country HSE Manager (Level 2) of Vietnam restricts the Dashboard filter and Distribution Centers dropdown strictly to Vietnam. Changing the active country context dynamically updates the UI context instantly.

---

## 8. Key User Journeys

To illustrate the real-world operational flows within the DKSH HSE CAPA System, the following user journeys define the exact paths of our primary target personas:

### Journey 1: The First-Line Frontline Reporter (Level 1 Role)
* **Context**: A warehouse supervisor witness at a distribution center discovers a hazard or witnesses a minor injury.
* **Flow Steps**:
  1. **Accessing the Form**: The reporter opens the application on their mobile tablet, navigating immediately to the "New Ticket" tab.
  2. **Context Logging (Step 1)**: Selects the date, time, and incident category (e.g., Near Miss), then inputs the active Distribution Center.
  3. **Roster Enrollment (Step 2)**: Adds involved persons and key witnesses to the local session roster with corresponding IDs and departments.
  4. **Interim Saving**: Realizing they need to verify a badge ID, the supervisor clicks "Save Draft" at Step 2. The system caches all typed inputs locally and issues a success toast.
  5. **Resuming and Completion (Step 3)**: Returning later, they find their draft under "My HSE Tickets Log", click "Edit", and the wizard immediately resumes at Step 2 with all values restored. They proceed to Step 3 to describe the narrative, complete the safety checklist, sign the PDPA privacy consent directly on Step 3, and submit the ticket. (They are restricted from accessing Step 4).

### Journey 2: The Country HSE Manager (Level 2 Role)
* **Context**: An HSE Manager responsible for operations in a single country (e.g., Thailand) logs in to manage local KPIs and investigate tickets.
* **Flow Steps**:
  1. **Local Performance Audit**: Navigates to the "Country Dashboard" to audit local statistics. The multi-market system automatically pre-filters the view specifically to Thailand.
  2. **Operational Logging**: Clicks the restricted "Insert Labor Hours" action block, enters the active operational month, and logs the latest work hours to keep safety rate computations (LTIFR / TRIFR) mathematically precise.
  3. **Root Cause Analysis (5-Whys)**: Selects a newly submitted ticket from the "My HSE Tickets Log" and transitions to Step 4. They perform a structured 5-Whys diagnostic chain to map the systemic root failure.
  4. **CAPA Assignment & Compliance Sign-off**: Defines immediate containment actions, assigns long-term preventive actions with explicit owners/target dates, and performs the final verifier sign-off to officially close out and archive the resolved ticket for their country.

### Journey 3: The Regional HSE Manager / Superuser (Level 3 Role)
* **Context**: A regional director oversees safety standards across all of Asia-Pacific and needs global configuration rights.
* **Flow Steps**:
  1. **Consolidated Overview**: Navigates to the "Regional Dashboard", reviewing high-level safety trend charts and country-level comparison tables across all operational countries.
  2. **Master Site List Updates**: Navigates to the restricted "Masters (DC Config)" tab. As a regional superuser, they possess authorization to append newly commissioned distribution centers and toggle the operational status of existing sites.
  3. **Compliance Sign-off**: Audits all open tickets with active CAPA items, conducts final verification, and closes out the resolved investigations to archive them securely.
