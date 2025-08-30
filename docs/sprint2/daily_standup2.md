# Daily Standup Meeting – August 27th, 2025  
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
