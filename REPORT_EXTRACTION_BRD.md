# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## HSE CAPA Production System: Report Extraction Feature

---

### Document Control

| Metadata | Details |
| :--- | :--- |
| **Document Title** | Business Requirements Document (BRD) — HSE Report Extraction & Analytics Export |
| **Project Name** | DKSH HSE CAPA Production System |
| **Version** | 1.0.0 |
| **Date** | July 5, 2026 |
| **Status** | Approved / For Implementation |
| **Author** | Lead HSE Systems Architect / Business Analyst |
| **Target Audience** | Development Team, Global HSE Steering Committee, Country HSE Managers |

---

## 1. Executive Summary & Project Context

### 1.1 Project Background
The **DKSH HSE CAPA Production System** is an enterprise-grade Health, Safety, and Environment (HSE) management platform designed to track, audit, and analyze workplace incidents, safety inspections, non-conformances, and **Corrective and Preventive Actions (CAPA)**. 

To maintain regulatory compliance (such as **ISO 45001** and **ISO 14001**), support global corporate governance, and drive continuous safety improvements, HSE stakeholders require a robust, flexible, and secure **Report Extraction Feature**. This feature allows users to filter, compile, preview, and download critical safety performance records and CAPA logs.

### 1.2 Objective of the Feature
The primary objective of the **Report Extraction Feature** is to provide seamless, self-service data export capabilities. It translates raw operational HSE records—such as working hours, incident tallies, CAPA ticket lifecycles, and audit results—into auditable, executive-ready offline formats (**Excel/CSV** and **PDF Executive Summaries**).

---

## 2. User Roles & Security Matrix (Role-Based Access Control)

The Report Extraction feature must strictly enforce the existing role hierarchy to ensure data privacy, commercial safety security, and operational integrity.

| Role Profile | Data Access Scope | Allowed Export Formats | Functional Permissions / Constraints |
| :--- | :--- | :--- | :--- |
| **Superuser** <br>*(Global Admin)* | **Global Scope**<br>Access to all countries, markets, business units, and historical archives. | • Raw CSV/XLSX Dumps<br>• PDF Executive Summaries<br>• Board-level Slide Deck Exports | • Full unrestricted download capacity.<br>• Access to cross-country labor statistics and incident investigations.<br>• Administrative control to modify master configurations (Distribution Centers) globally. |
| **Regional HSE Manager** <br>*(Regional Coordinator)* | **Regional Scope**<br>Access to all assigned countries/markets within their region (e.g., APAC). | • Raw CSV/XLSX Dumps (Consolidated or by Market)<br>• PDF Executive Summaries | • Full viewing, analytical, and extraction rights across all regional markets.<br>• Can verify investigations and CAPA sign-offs globally.<br>• Excluded from master master list (DC) modifications outside authorization. |
| **Country HSE Manager** <br>*(Level 2)* | **Single Market Scope**<br>Access restricted to their authorized Country/Market context. | • Raw CSV/XLSX Dumps<br>• Market PDF Summaries | • Restructured to their specific market (e.g. Thailand, Malaysia, Vietnam).<br>• Cannot export cross-border statistics without explicit global delegation. |
| **Reporter** <br>*(Level 1)* | **Restricted Local Scope**<br>Read-only access to localized dashboards and standard incident records. | • Basic Excel lists of logged incidents and tickets. | • Excluded from raw labor hour exports or aggregate payroll safety calculations.<br>• Data is masked for sensitive personal information (PII). |

---

## 3. Scope of Report Extraction

### 3.1 In-Scope Requirements
1. **Multi-Format Export Engine**: Support for CSV (comma-separated values), Excel-compatible spreadsheets, and PDF documents.
2. **Interactive Filter Panel**: Granular parameters for Date Range (Quick Presets and Custom Calendar), Country/Market, Incident Classifications, Severity Level, and CAPA Status.
3. **DKSH Performance Indicators (KPIs)**: Calculation of safety indices, including:
   - **Lost Time Injury Frequency Rate (LTIFR)**
   - **Total Recordable Injury Rate (TRIR)**
   - **Severity Rate (SR)**
   - **Work Hours vs. Incident Correlation Graphs**
4. **CAPA Roster Logs**: Clear spreadsheets detailing Outstanding Actions, Owners, Root Cause Classifications, Target Closure Dates, and Aging Timelines.
5. **Personal Identifiable Information (PII) Protection**: Redaction of worker names, witness names, and medical details for standard reporter exports.

### 3.2 Out-of-Scope Requirements
1. **Automated SFTP Delivery**: Automatically pushing generated files to external third-party servers (to be considered for Phase 2).
2. **Custom SQL Query Builder**: Direct database querying capability for end-users. All exports must adhere to standardized system templates.

---

## 4. Functional & Interface Specifications

### 4.1 Filter and Criteria Definition
Before extracting any data, the user must interact with an intuitive, mobile-responsive filter interface.

- **Date Range Selector**:
  - **Quick Presets**: "Current Month", "Last 30 Days", "Current Quarter", "Year to Date (YTD)", and "Previous Fiscal Year".
  - **Custom Range**: Dual interactive calendar widgets supporting Start Date and End Date.
- **Market Scope Selection**:
  - If the user is a *Superuser*, this is an active dropdown displaying all active markets (e.g., Vietnam, Malaysia, Thailand, Singapore, Indonesia).
  - If the user is a *Country HSE Manager* or *Reporter*, this dropdown is permanently disabled/locked and pre-selected to their authorized country.
- **Incident Severity Filters**: Checkboxes for:
  - **LTI** (Lost Time Injury)
  - **MTC** (Medical Treatment Case)
  - **FAC** (First Aid Case)
  - **Near Miss**
  - **Unsafe Act / Unsafe Condition**
- **CAPA Ticket Lifecycle Status**: Options to filter by "All", "Open & Overdue", "Under Review", or "Closed & Verified".

---

### 4.2 Data Layout & Export Templates

#### Template A: Raw Operational Dump (CSV / XLSX)
Designed for deep data analysis, pivoting, and loading into corporate BI platforms (e.g., Power BI, Tableau).

| Column Name | Data Type | Sample Value | Business Logic / Validation |
| :--- | :--- | :--- | :--- |
| **Ticket_ID** | String (Unique) | `CAPA-2026-049` | Unique primary key formatted as standard ticket nomenclature. |
| **Market_Country** | Option | `Thailand` | Country where the incident or audit occurred. |
| **Logged_Date** | Date | `2026-04-12` | Timestamp of entry into the system (YYYY-MM-DD). |
| **Incident_Classification** | String | `LTI` | Classification hierarchy validated against safety standards. |
| **Brief_Description** | String | `Forklift collision near dock 4` | Summarized text entry (truncated to 255 characters for CSV safety). |
| **Immediate_Action** | String | `Quarantined forklift, area flagged` | Immediate mitigative action taken within 24 hours. |
| **CAPA_Action_Required** | String | `Reroute pedestrian walkway & repaint` | Permanent corrective action planned. |
| **Action_Owner** | String | `Somsak P.` | Designated assignee. |
| **Target_Due_Date** | Date | `2026-05-30` | SLA target date for completion. |
| **Current_Status** | Enum | `Overdue` | Active status: `Open`, `Closed`, `Overdue`. |
| **Days_Open_Aging** | Integer | `45` | Calculated as: `Current_Date` minus `Logged_Date` (if status is Open/Overdue). |

---

#### Template B: Executive PDF Dashboard Summary
Designed for distribution during Monthly Country Management Meetings and Regional Safety Committee Reviews.

- **Structure of PDF Document**:
  1. **Corporate Branding Header**: DKSH Logo, Title "HSE Performance & CAPA Compliance Report", Selected Date Range, Generation Timestamp.
  2. **Executive Summary Grid (KPI Highlights)**:
     - **Safe Work Days**: Consecutive days without a Lost Time Injury (LTI).
     - **LTIFR** (Lost Time Injury Frequency Rate): (Total LTIs * 1,000,000) / Total Working Hours.
     - **TRIR** (Total Recordable Injury Rate): (Total Recordable Cases * 1,000,000) / Total Working Hours.
  3. **High-Level Visual Charts**:
     - *Bar Chart*: Incidents by Type (LTI, MTC, FAC, Near Miss).
     - *Pie Chart*: CAPA Tickets status distribution.
     - *Trend Line*: Man-Hours vs Incident rates month-over-month.
  4. **Overdue CAPA Action Table**: Truncated roster of top 5 critical overdue items requiring immediate executive intervention.
  5. **Formal Footer**: "Page X of Y — Confidential — Generated via DKSH HSE CAPA Production Portal".

---

## 5. Calculations & Analytical Business Logic

To maintain mathematical standardization across all global operations, the export and analytical engine must calculate metrics on-the-fly according to the standard corporate rate formula.

### 5.1 Standard Formula Rate Principle
The system applies a uniform frequency rate standard based on **1,000,000 exposure hours worked**:
$$\text{Standard Rate} = \frac{\text{Total Incident Cases of Specific Type} \times 1,000,000}{\text{Total Labor Hours Worked}}$$

---

### 5.2 Complete Mathematical Indicator Matrix

The safety rates and counts are mathematically classified and audited against the following master matrix:

| No. | Indicator / Chart Name | Formula / Calculation Methodology | Short Form | Category Scope |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Fatalities Result** | $\frac{\text{Total Fatalities (No.7)} \times 1,000,000}{\text{Total Labor Hours Worked}}$ | **DEATH** | Fatal occurrences during work hours. |
| **2** | **High Consequence Work-Related Injuries** | $\frac{\text{Total High-Consequence Work-Related Injuries (No.8)} \times 1,000,000}{\text{Total Labor Hours Worked}}$ | **>6M** | Injuries resulting in recovery time >6 months. |
| **3** | **Lost Time Injury Rate** | $\frac{\text{Total Lost Time Injuries (No.9)} \times 1,000,000}{\text{Total Labor Hours Worked}}$ | **LTI** | Injuries causing at least 1 full day/shift of absence. |
| **4** | **Recordable Injuries** | $\frac{\text{Total Recordable Work-Related Injuries (No.8-13)} \times 1,000,000}{\text{Total Labor Hours Worked}}$ | **REC** | Sum of recordable injuries (No. 8 through 13). |
| **5** | **Work-Related Injuries** | $\frac{\text{Total Work-Related Injuries (No.8-14)} \times 1,000,000}{\text{Total Labor Hours Worked}}$ | **WRI** | Sum of all work-related injuries (No. 8 through 14). |
| **6** | **Property Damage Cases** | $\text{Absolute Case Count}$ | **PD** | Incidents resulting in asset/equipment damage only. |
| **7** | **Near Miss Cases** | $\text{Absolute Case Count}$ | **NM** | Potential hazards with no actual injury or loss. |
| **8** | **Hazard Observation Cases** | $\text{Absolute Case Count}$ | **HZ** | Identified unsafe behaviors or physical conditions. |

---

### 5.3 Technical Specifications for Data Collection
1. **Total Labor Hours Worked (Denominator)**: Represents the consolidated sum of Direct Employee Hours and Contractor/Subcontractor Hours within the specified Date Range.
2. **Standard Classifications**:
   - Classifications 1 to 5 require dynamic rate calculations (normalized per 1M hours).
   - Classifications 6 to 8 represent simple integer counters (Case Numbers) and do not utilize the labor hours denominator.
3. **No-Activity Safety Baseline**: If Total Labor Hours Worked is 0, the rates default to `0.00` with a warning flag instead of throwing division-by-zero exceptions.

---

## 6. Non-Functional & Technical Requirements

### 6.1 Performance and Scalability
- **SLA on Extraction**: Large-scale raw data dumps encompassing up to 100,000 historical rows must process and start downloading within **5 seconds**.
- **On-the-Fly Generation**: PDFs and Charts must be generated server-side or via optimized client-side libraries (such as `jspdf` or `xlsx` with memory-efficient streams) without freezing or locking the browser tab.

### 6.2 Data Security & Auditing
- **Audit Logging**: Every extraction activity must append a record to the central system audit log containing:
  - `User_ID` & `Role`
  - `Action` (e.g. `EXPORT_EXCEL_CAPA_ROSTER`, `EXPORT_PDF_EXECUTIVE_SUMMARY`)
  - `Filters_Applied` (e.g. `Country=Vietnam; Dates=2026-01-01_to_2026-06-30`)
  - `Rows_Extracted_Count`
- **Data Encapsulation**: Restrict front-end source maps from exposing any un-redacted datasets for unauthorized countries in the client-side state.

### 6.3 Compliance and Usability
- **Accessibility**: PDF documents should pass basic screen-reader compliance tests (contrast ratios of text to backgrounds must meet WCAG 2.1 AA standards).
- **Mobile Friendliness**: In mobile view, the extraction modal or settings drawer must be perfectly responsive, stacked vertically, with large click targets (minimum 44x44px for export buttons).

---

## 7. Workflow Acceptance Criteria

To declare the Report Extraction feature ready for production, it must successfully pass the following validation steps:

```
+-------------------------------------------------------+
|                 1. Filter Selection                   |
|  - Define target Date Range, Market and Categories    |
+--------------------------+----------------------------+
                           |
                           v
+-------------------------------------------------------+
|              2. Security Validation                   |
|  - System checks user's token and restricted scope    |
+--------------------------+----------------------------+
                           |
                           v
+-------------------------------------------------------+
|               3. On-The-Fly Packaging                 |
|  - Dynamic computation of LTIFR, TRIR and aging days  |
+--------------------------+----------------------------+
                           |
                           v
+-------------------------------------------------------+
|                4. Verification & Audit                |
|  - Write action log to Central Security Registry      |
+--------------------------+----------------------------+
                           |
                           v
+-------------------------------------------------------+
|                  5. Stream Download                   |
|  - User receives finalized CSV, XLSX, or PDF file     |
+-------------------------------------------------------+
```

1. **Test Case 1 (Superuser Scope)**: Triggering a regional export correctly returns a aggregate summary table combining Thailand, Vietnam, and Malaysia with accurate mathematical weighting.
2. **Test Case 2 (Reporter Isolation)**: A user simulated with a "Reporter" role attempts to download Thailand data. The browser successfully receives the file containing *only* Thailand, with columns containing full worker names redacted/replaced with `[CONFIDENTIAL]`.
3. **Test Case 3 (Zero Records Fallback)**: If a selected date range has zero incident reports and zero working hours recorded, the export yields a clean, friendly notification warning instead of returning empty Excel errors.
