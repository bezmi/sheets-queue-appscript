# Deployment Guide for the Live Queue System

This document provides a step-by-step guide for system administrators to deploy the Live Queue System using Google Sheets and GitHub Pages.

### Part 1: Google Sheet & Apps Script Setup

This part creates the backend "database" and API for the application.

1.  **Create a Google Sheet:**
    *   Go to [sheets.google.com](https://sheets.google.com) and create a new, blank spreadsheet. You can name it anything.

2.  **Open the Apps Script Editor:**
    *   In your new sheet, click on **Extensions > Apps Script**. A new browser tab will open with the script editor.

3.  **Paste the Script Code:**
    *   Delete any boilerplate code in the `Code.gs` editor window.
    *   Copy the entire contents of the `Code.gs` file from the project repository and paste it into the editor.

4.  **Set Your Secret Password:**
    > **IMPORTANT:** This is a critical security step.
    *   Near the top of the script, find the line:
        ```javascript
        const PRE_SHARED_PASSWORD = "change-this-secret-password";
        ```
    *   Change the value inside the quotes to a strong, unique password. This password will be required by tutors to create or manage sessions.

5.  **Save and Deploy the Script:**
    *   Click the "Save project" icon (a floppy disk).
    *   Click the blue **Deploy** button and select **New deployment**.
    *   Click the gear icon next to "Select type" and choose **Web app**.
    *   In the "Configuration" settings, enter the following:
        *   **Description:** `Live Queue System API`
        *   **Execute as:** `Me` (Your Google Account)
        *   **Who has access:** `Anyone`
    *   Click **Deploy**.

6.  **Authorize the Script:**
    *   Google will prompt you to authorize the script's permissions. Click **Authorize access**.
    *   Choose your Google account.
    *   You may see a "Google hasn't verified this app" warning. This is normal. Click **Advanced**, then click **"Go to [Your Project Name] (unsafe)"**.
    *   Click **Allow** on the final permissions screen.

7.  **Copy the Web App URL:**
    *   After successful deployment, a window will appear with your **Web app URL**.
    *   **Note this URL down somewhere.** You will need it in the next part. It will look like `https://script.google.com/macros/s/.../exec`.

### Part 2: GitHub Pages Setup

This part sets up the user-facing HTML files.

1.  **Create a GitHub Repository:**
    *   Create a new, public repository on GitHub for this project (e.g., `queue-system`).

2.  **Add Project Files:**
    *   Upload the three HTML files from this project to your new repository:
        *   `index.html` (the login page)
        *   `session.html` (the queue view page)
        *   `join.html` (the student submission page)

3.  **Exclude Sensitive Files (Optional but Recommended):**
    *   To ensure the script source code and documentation are not published on your website, create a file named `.gitignore` in your repository and add the following lines:
        ```
        Code.gs
        README.md
        DEPLOY.md
        ```

4.  **Configure the HTML Files:**
    *   You must now connect your HTML files to your Apps Script backend.
    *   Open `index.html`, `session.html`, and `join.html` for editing.
    *   In **each of the three files**, find the line:
        ```javascript
        const webAppUrl = 'PASTE_YOUR_WEB_APP_URL_HERE';
        ```
    *   Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the Web app URL from Part 1, Step 7.
    *   Commit and push these changes to your GitHub repository.

5.  **Enable GitHub Pages:**
    *   In your GitHub repository, go to **Settings > Pages**.
    *   Under "Build and deployment", select the **Source** as **"Deploy from a branch"**.
    *   Under "Branch", select your main branch (usually `main` or `master`) and keep the folder as `/ (root)`.
    *   Click **Save**.

6.  **Test Your Deployment:**
    *   Wait a minute or two for GitHub to build and deploy your site.
    *   Your live URL will be displayed on the GitHub Pages settings screen (e.g., `https://<your-username>.github.io/<your-repo-name>/`).
    *   Visit this URL to access the login page and test the full system.
