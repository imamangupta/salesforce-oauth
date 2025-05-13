# Salesforce OAuth End-to-End Implementation

This guide provides a step-by-step implementation for a Salesforce OAuth 2.0 connection. We'll cover the entire process from setting up a Connected App in Salesforce to implementing the OAuth flow in a sample application.

## **Prerequisites**

1. Salesforce Developer Edition account (free)
2. Basic understanding of REST APIs and web development

## **Step 1: Set Up a Connected App in Salesforce**

1. Log in to your Salesforce account
2. Navigate to **Setup** (gear icon) → **Setup**
3. In the Quick Find box, type "App Manager" and select it
4. Click "New Connected App"
5. Fill in the required details:
    - Connected App Name: **`My OAuth`**
    - API Name: **`My_OAuth`**
    - Contact Email: [your email]
    - Enabled OAuth Settings: Check this box
    - Callback URL: **`http://localhost:3000/oauth/callback`**
    - Selected OAuth Scopes: Add:
        - **`Access and manage your data (api)`**
        - **`Perform requests on your behalf at any time (refresh_token, offline_access)`**
        - **`Provide access to your data via the Web (web)`**
6. Click "Save"
7. After saving, note down:
    - Consumer Key (Client ID)
    - Consumer Secret (Client Secret)

---

### **Step 2: User Initiates OAuth Flow**

1. User clicks a **"Login with Salesforce"** button.
2. The app redirects to Salesforce’s authorization endpoint:
    
    ```
    https://login.salesforce.com/services/oauth2/authorize?
      response_type=code&
      client_id=<CLIENT_ID>&
      redirect_uri=<REDIRECT_URI>&
      scope=api+refresh_token
    ```
    
3. User logs in (if not already) and **approves access**.

---

### **Step 3: Salesforce Redirects with Authorization Code**

1. After approval, Salesforce redirects back to the **Callback URL** with a **temporary authorization code**:
    
    ```
    https://yourdomain.com/oauth/callback?code=AUTHORIZATION_CODE
    ```
    

---

### **Step 4: Exchange Authorization Code for Access Token**

1. The backend server makes a **POST request** to Salesforce’s token endpoint:
    
    ```
    POST https://login.salesforce.com/services/oauth2/token
    ```
    
    With the following form data:
    
    - **`grant_type=authorization_code`**
    - **`code=AUTHORIZATION_CODE`**
    - **`client_id=CLIENT_ID`**
    - **`client_secret=CLIENT_SECRET`**
    - **`redirect_uri=REDIRECT_URI`**
2. Salesforce responds with an **access token** and a **refresh token**:
    
    json
    
    ```
    {
      "access_token": "ACCESS_TOKEN",
      "instance_url": "https://yourinstance.salesforce.com",
      "id": "https://login.salesforce.com/id/ORG_ID/USER_ID",
      "token_type": "Bearer",
      "issued_at": "TIMESTAMP",
      "signature": "SIGNATURE",
      "refresh_token": "REFRESH_TOKEN"
    }
    ```
    

---

### **Step 5: Use Access Token for API Calls**

1. The app can now call Salesforce APIs using the **`access_token`**:
    
    http
    
    ```
    GET /services/data/v56.0/query?q=SELECT+Id,Name+FROM+Account+LIMIT+5
    Host: yourinstance.salesforce.comAuthorization: Bearer ACCESS_TOKEN
    ```
    
2. The **`access_token`** expires (typically in **2-24 hours**).

---

### **Step 6: Refresh Expired Access Token (Optional)**

1. If the **`access_token`** expires, use the **`refresh_token`** to get a new one:
    
    ```
    POST https://login.salesforce.com/services/oauth2/token
    ```
    
    With form data:
    
    - **`grant_type=refresh_token`**
    - **`refresh_token=REFRESH_TOKEN`**
    - **`client_id=CLIENT_ID`**
    - **`client_secret=CLIENT_SECRET`**
2. Salesforce responds with a **new `access_token`** (without requiring user login).

# **Key Data You Can Retrieve from Your Salesforce Account**

Here's a comprehensive breakdown of the most important data you can extract from your Salesforce account using APIs, categorized by functionality:

---

## **1. User & Authentication Data**

- **Your user profile** (name, email, contact info)
- **Login history** (IP addresses, timestamps, failed attempts)
- **Session details** (active sessions, timeout settings)
- **Password policies** (expiration rules, complexity requirements)
- **Multi-factor authentication (MFA) status**

*Sample Endpoint*:

**`GET /services/oauth2/userinfo`**

---

## **2. Profile & Permission Data**

- **Assigned profile** (e.g., "System Administrator")
- **Object permissions** (CRUD access for Accounts, Contacts, etc.)
- **Field-level security** (which fields are visible/editable)
- **Assigned permission sets** (additional permissions)
- **Custom permissions** (special business logic access)
- **Login IP restrictions** (whitelisted IP ranges)

*Sample Endpoint*:

**`GET /services/data/v58.0/query?q=SELECT+PermissionsModifyAllData+FROM+Profile`**

---

## **3. Organization Data**

- **Company information** (org name, type, instance URL)
- **User licenses** (available vs. used)
- **Data storage usage** (objects, file storage)
- **API usage limits** (daily API call quota)
- **Enabled features** (Einstein, CPQ, etc.)

*Sample Endpoint*:

**`GET /services/data/v58.0/query?q=SELECT+Name,InstanceName+FROM+Organization`**

---

## **4. Business Data (Records)**

### **Standard Objects**

- **Accounts, Contacts, Leads, Opportunities**
- **Cases, Solutions, Products**
- **Campaigns, Tasks, Events**

### **Custom Objects**

- All your organization's custom objects/tables

*Sample Endpoint*:

**`GET /services/data/v58.0/query?q=SELECT+Id,Name+FROM+Account`**

---

## **5. Metadata & Configuration**

- **Object schemas** (fields, relationships, picklists)
- **Page layouts** (UI configurations)
- **Workflow rules & processes**
- **Validation rules**
- **Custom settings & custom metadata**

*Sample Endpoint*:

**`GET /services/data/v58.0/sobjects/Account/describe`**

---

## **6. Automation & Integration Data**

- **Apex Classes** (custom code)
- **Triggers**
- **Flows & Process Builder**
- **Connected Apps** (OAuth integrations)
- **API integration logs**

*Sample Endpoint*:

**`GET /services/data/v58.0/tooling/query?q=SELECT+Id,Name+FROM+ApexClass`**

---

## **7. Security & Compliance Data**

- **Field audit trails** (who changed what)
- **Login history** (who accessed when)
- **Sharing rules** (record visibility)
- **Data export history**
- **Compliance certifications**

*Sample Endpoint*:

**`GET /services/data/v58.0/query?q=SELECT+Field,OldValue,NewValue+FROM+AccountHistory`**

---

## **Data Retrieval Summary Table**

| **Category** | **Examples of Retrievable Data** | **API Coverage** |
| --- | --- | --- |
| **User Data** | Profile, permissions, login history | 100% |
| **Business Data** | Accounts, Contacts, custom objects | 100% |
| **Metadata** | Objects, fields, layouts | 100% |
| **Reports** | All standard/custom reports | 100% |
| **Automation** | Flows, Apex, triggers | 100% |
| **Security** | Audit trails, sharing rules | 100% |
| **Custom Apps** | Lightning components, tabs | 100% |
| **Limits** | API calls, storage | 100% |