# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## HSE Incident & CAPA Compliance Portal — Business Sign-Off Edition

<!-- Business Sign-Off Version -->

---

### Document Control

| Item | Specification Details |
| :--- | :--- |
| **Document Title** | Business Requirements Document (BRD) — Executive Sign-Off Edition |
| **Project Name** | DKSH HSE CAPA Production System |
| **System Version** | 1.1.0 (Business Specification) |
| **Release Date** | July 6, 2026 |
| **Target Audience** | Business Sponsors, Country HSE Directors, Regional Executive Steering Committee |
| **Document Status** | **For Review & Sign-Off** |

---

## 1. Executive Summary & Vision

### 1.1 Project Background
Health, Safety, and Environment (HSE) management is a critical pillar of operational excellence at DKSH. The **DKSH HSE Incident & CAPA Compliance Portal** is designed to digitize and standardize workplace incident logging and Corrective and Preventive Action (CAPA) tracking across the Asia-Pacific region.

This portal acts as a central register for HSE incidents and CAPA records. The primary goal is to replace manual spreadsheets, eliminate communication gaps, and provide a single source of truth for regional safety performance and regulatory compliance.

### 1.2 Key Objectives
- **Standardize Incident Reporting**: Provide an easy-to-use, structured wizard for site-level coordinators to log occurrences (injuries, near misses, hazards) accurately.
- **Enhance Root Cause Analysis**: Embed structured problem-solving (such as the 5-Whys methodology) directly into incident investigations.
- **Ensure Regional Transparency**: Provide leadership with a centralized dashboard tracking regional KPIs like LTIFR and TRIR to drive safety culture improvements.
- **Enforce Data Governance**: Secure access to sensitive safety records so users only see and manage records relevant to their authorized market.

---

## 2. User Roles & Access Rights

To ensure proper data privacy and system governance, four standard user roles are defined. This matrix details what each role is permitted to perform in the portal:

| User Role | Dashboard Scope | Incident Reporting | Incident Investigation | Labor Hours Entry |
| :--- | :--- | :--- | :--- | :--- |
| **Reporter** <br>*(Level 1)* | View Country Dashboard (locked to local context) | Can create, edit, and save drafts of incidents | No access to Step 4 (Investigation) | View-only (cannot modify labor hours) |
| **Country HSE Manager** <br>*(Level 2)* | View Country Dashboard (locked to local context) | Full access to create, edit, and submit | Full access to complete 5-Whys and close actions | Can input and unlock monthly labor hours for their country |
| **Regional HSE Manager** | Full Regional Dashboard (toggle between all APAC markets) | Full access across their region | Full access across their region | View-only or update hours for regional markets |
| **Superuser** <br>*(Global Admin)* | Consolidated global view with full market overrides | Full access to create, edit, or delete | Unrestricted access to complete investigations | Unrestricted entry and management of all labor hours |

---

## 3. Core Modules & Functional Workflows

The portal is composed of three primary functional modules designed to support the end-to-end incident lifecycle.

### 3.1 Module 1: HSE Performance Dashboard
The dashboard serves as the central landing page, presenting safety metrics in a clean, visual layout.

* **Key Indicators (KPIs)**:
  * **Safe Work Days**: Continuous count of calendar days since the last recorded Lost Time Injury (LTI).
  * **Frequency Rates**: Standard safety performance metrics (LTIFR, TRIR) calculated dynamically based on entered labor hours.
  * **Interactive Date Filter**: Supports quick selection presets (e.g., *Last 30 Days*, *Current Month*, *Year to Date (YTD)*) and custom date ranges.
* **Monthly Labor Hours Entry**:
  * Monthly configuration grid for entering direct employee hours and external contractor/other hours.
  * Accurate labor hours are critical to calculating precise frequency rates automatically.

### 3.2 Module 2: Step-by-Step Reporting Wizard
An intuitive wizard that guides reporters through the creation of complete, structured safety logs:

* **Step 1: General Info**: Captures date, time, specific site location, incident severity classification, and CC email notification list.
* **Step 3: Affected Body Map & Incident Category**: Interactive visual guide where users select affected body parts and check standard injury types (e.g., cut, bruise, burn) to build a clear record of the incident.
* **Step 4: Root Cause & CAPA**: A structured investigation panel including:
  * **5-Whys Root Cause Analysis**: A systematic line of questioning to identify the underlying cause of an event.
  * **Corrective & Preventive Actions (CAPA)**: Log specific action descriptions, designate responsible owners, and set clear target completion dates.

### 3.3 Module 3: CAPA Tickets Registry
A master log enabling teams to track, search, and manage all registered safety occurrences and action tickets.

* **Search and Filter Panel**: Filter records quickly by severity class, current ticket status (Open, Closed, Overdue), and local market.
* **Detail Drawer**: Slide-out panel providing a complete summary of the incident details, witness information, visual body damage map, 5-Whys, and CAPA logs.
* **Closure & Verification**: Enables Country and Regional Managers to verify actions and officially close resolved tickets.

---

## 4. Key Metrics & Calculations (High-Level)

To ensure consistency in corporate compliance auditing, the portal automatically calculates safety frequency rates normalized per **1,000,000 working hours**:

### 4.1 Lost Time Injury Frequency Rate (LTIFR)
Measures the frequency of injuries that result in at least one full shift of absence, relative to total exposure hours worked:
$$\text{LTIFR} = \frac{\text{Total Lost Time Injuries} \times 1,000,000}{\text{Total Working Hours}}$$

### 4.2 Total Recordable Injury Rate (TRIR)
Measures the frequency of all recordable work-related injuries (including fatalities, high-consequence injuries, lost-time injuries, and medical treatment cases) relative to total exposure hours worked:
$$\text{TRIR} = \frac{\text{Total Recordable Injuries} \times 1,000,000}{\text{Total Working Hours}}$$

---

## 5. Document Acceptance & Business Sign-Off

By signing below, the stakeholders agree that this document accurately defines the business, functional, and operational requirements for the **HSE Incident & CAPA Compliance Portal**. Any future changes to this scope will be subject to the project's standard change control process.

### 5.1 Business Stakeholders Signatures

| Stakeholder Role | Name / Title | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Business Sponsor** | | | |
| **Regional HSE Compliance Director** | | | |
| **Lead Business Analyst** | | | |
| **Country HSE Representative** | | | |

---

*End of Document — Confidential*
