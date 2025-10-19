# First Daily Standup Meeting  
**Date:** 24 August 2025
**Duration:** 22 minutes  
**Platform:** WhatsApp Call  

### **Attendees:**  
- Annah 
- Naledi  
- Jane  
- Risuna 
- Ntokozo  

### **Agenda:**  
- Update on everyone's progress

---

### **Meeting Notes:**

#### **1. Risuna**
- **Frontend:**  
  - **Current Status:** Started the basic layout and integrating route selection options.
  
- **Documentation:**  
  - **Current Status:** Drafting the User Stories for front-end pages and writing relevant test cases.

#### **2. Ntokozo**
- **Frontend & Backend:**  
  - **Frontend Work:** Creating UI components for progress charts and milestones.
  - **Backend Work:** Setting up the **Achievements API** for storing and querying accomplishment data.
  - **Current Status:** Working on API integration with frontend components.

#### **3. Jane**
- **Backend:**  
    - **Current Status:** Working on the API connection and ensuring weather data populates the frontend correctly.
  
  - **Friends Page Functionality:**  
    - **Current Status:** Setting up the backend structure and endpoints for retrieving friend activity.

#### **4. Naledi**
- **Frontend:**  
  - **Current Status:** Working on the layout of the friends' feed and ensuring data integration with the backend.

- **Backend:**  
  - **Current Status:** Implementing logic to create, store, and update planned hikes on the backend.

#### **5. Annah**
- **Frontend & Backend:**  
  - **Frontend:** Building the components for displaying recent hikes, milestones, and a summary of progress.
  - **Backend:** Integrating with APIs to fetch and display dynamic data in the dashboard.
  - **Current Status:** Developing the components and linking them to the backend data.

---

### **Action Items:**
- **Risuna** to complete drafting User Stories and finish UAT for the upcoming features.
- **Ntokozo** to finalize the integration of the Achievements Page with backend APIs and begin testing.
- **Jane** to continue with the Weather API integration and complete the Friends Page functionality.
- **Naledi** to finish the Friends Page frontend and ensure the Plan Hike Page backend is properly integrated.
- **Annah** to complete dashboard components and connect with the backend APIs.

---

### **Conclusion:**
- Everyone is on track with their assigned tasks.
- The team is making good progress with integrating the backend and frontend components for key pages.
- Next check-in to address blockers or dependencies in the upcoming standup.
  

# Second Daily Standup Meeting – August 27th, 2025  
**Duration:** 20 minutes  
**Platform:** WhatsApp Call  

### **Attendees:**  
- Ntokozo 
- Jane  
- Annah  
- Risuna  
- Naledi 

### **Agenda:**  
- Discussion of current blockers and bugs 
- Updates on ongoing tasks.  

---

### **Meeting Notes:**

#### **1. Risuna**
- **Frontend:**
  - Encountered a **bug** where the **Plan Hike Page** did not correctly fetch and display the weather data.
  - **Current Status:** Investigating API issue and planning to implement a fallback weather message.


#### **2. Ntokozo**
- **Frontend & Backend:**
  - The **Achievements Page** is still not fully functional.
  - **Blocker:** The **backend API** that aggregates hike data is returning `null` values for some users. Waiting for **backend fix**.
  - **Current Status:** Once backend API fix is deployed, will resume integration.

#### **3. Jane**
- **Backend:**
  - **Blocker:** The weather API has **request limits**, and frequent testing has caused the API to temporarily block further requests.
  - **Current Status:** Looking for ways to bypass the rate limit, either by using mock data for now or optimizing the requests.

#### **4. Naledi**
- **Frontend:**
  - The **Friends Page** layout is **mostly complete**, but some **styling issues** remain when viewing the page on mobile.
  - **Current Status:** Reviewing and fixing the responsive design issues using Tailwind breakpoints.

- **Backend:**
  - **Plan Hike Page** backend integration is working, but there are **inconsistencies**.

#### **5. Annah**
- **Frontend & Backend:**
  - **Dashboard page** still needs some final touches. Codecov is failing and 33 lines are not covered.
  - **Blocker:** Slow page loads. 

---

### **Conclusion:**
- The team is facing **blockers** mostly related to **API integrations** and **performance issues**.
- **Weather API** issues are affecting multiple pages, and **Friends API** is slow due to database query issues.
- Once the blockers are fixed, the team will continue with their individual tasks.

---

### **Next Steps:**  
- Address blockers and bugs before proceeding with the implementation of other pages.
- Follow up in the next standup to see if any blockers remain unresolved.

