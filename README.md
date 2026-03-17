# Salesforce Developer Assessment - Acme Services 🚀

This repository contains the source code for the Salesforce Developer Assessment. The goal of this project was to deliver a "vertical slice" for Engagement management using a mix of Frontend (LWC), Backend (Apex), and declarative automation (Flows).

## 🛠️ Technologies Used
* **Frontend:** Lightning Web Components (LWC), JavaScript, HTML, CSS.
* **Backend:** Apex (SOQL, OOP).
* **Automation:** Salesforce Record-Triggered Flows.
* **Version Control:** Git & GitHub.

## 📂 Code Structure (Direct Links)
To facilitate the code review, here are the direct links to the custom components built for this assessment:

### 1. Lightning Web Component (LWC)
The `engagementSummary` component displays related Opportunity amounts and aggregate stats, along with a quick action to create Follow-Up Tasks.
* 🔗 [engagementSummary.html](./force-app/main/default/lwc/engagementSummary/engagementSummary.html)
* 🔗 [engagementSummary.js](./force-app/main/default/lwc/engagementSummary/engagementSummary.js)

### 2. Apex Controller
The `EngagementController` handles heavy data aggregation (SOQL COUNT queries) that are not natively supported by Lightning Data Service.
* 🔗[EngagementController.cls](./force-app/main/default/classes/EngagementController.cls)

## ⚙️ Assumptions & Best Practices
* **No Hardcoded IDs:** All record IDs are fetched dynamically using Context (`$recordId`) or SOQL queries to ensure deployment safety.
* **Separation of Concerns:** UI APIs (LDS) were used for record creation to optimize performance, while Apex was strictly reserved for complex aggregations.
* **Fault Handling:** Error handling is implemented both in LWC (Toast Events on `.catch`) and in the Flow (Fault Paths).
