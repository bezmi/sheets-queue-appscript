# Tutor's Guide to the Live Queue System

Welcome! This guide explains how to use the live queue system to manage your busy tutorial sessions effectively.

### 1. How to Start a New Session

Everything starts from the main login page.

1.  Navigate to the system's main URL (e.g., `https://your-university.github.io/queue-system/`).
2.  In the **Session Name** box, enter a unique name for your session (e.g., `cs101-wednesday-lab`).
3.  In the **Admin Password** box, enter the pre-shared password for the system.
4.  Click **"Create / Join Session"**.

You will be automatically redirected to the admin page for your session. **You should bookmark this new page!** Your browser's URL now contains your unique, secret admin key.

### 2. The Admin Page vs. The Read-Only Page

There are two ways to view a session queue, and it all depends on the URL:

| Feature                  | Your Admin Page (`...&key=...`)                                                                    | Read-Only Page (no key)                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Who Sees It**          | **You, the tutor.** Your URL has a secret `&key=...` at the end. Keep this page to yourself.          | Students, or a projector screen. The URL has no key.      |
| **Controls**             | You can see and use the configuration panel ("Max Concurrent", "Warning Time") and action buttons ("Start", "Delete"). | No configuration or action buttons are visible.         |
| **Purpose**              | Actively manage the queue.                                                                         | Passively view the queue's status.                        |

### 3. Getting Students into the Queue

On your admin page, you will see a blue box with a link. This is the **Join Link**.

*   **Share this link with your students.** Post it in your chat, on the board, or in your learning management system.
*   When students visit this link, they will see a simple form where they can enter their name to be added to the bottom of the queue.

### 4. Configuring Your Session

On the admin page, you have two settings:

*   **Max Concurrent Students:** This controls how many students at the top of the list will have a "Start" button.
    > **Note:** This value should typically be set to the **number of tutors available** in the session. If you have two tutors, set it to `2`.
*   **Active Time Warning (mins):** This sets a timer. If a student's "active" time goes beyond this limit, their row will be highlighted in **red** as a visual reminder to wrap up.

### 5. Managing Students in the Queue

Each student in the list has a timer and, for you, action buttons.

*   **The Timers:**
    *   `W: 00:01:30` - The student is **Waiting**. The timer shows how long it has been since they joined.
    *   `A: 00:05:10` - The student is **Active**. The timer shows how long it has been since you started working with them.

*   **The "Start" Button:**
    *   This button appears for the top student(s) in the queue (as defined by "Max Concurrent Students").
    *   Clicking it signifies you have started helping that student. Their row will highlight **green**, and their timer will switch from "Waiting" to "Active".

*   **The "Delete" Button:**
    *   When you are finished helping a student, click this button.
    *   The student will be instantly removed from the list, and the next person in the queue will move up.

### 6. What If I Accidentally Close My Admin Tab?

No problem! You can always get back control of your session.

1.  Go back to the main login page (`index.html`).
2.  Enter the **exact same Session Name** you used before.
3.  Enter the admin password.
4.  Click **"Create / Join Session"**.

The system will recognize the existing session and generate a **new, secure admin key** for you, redirecting you to the admin page. The old admin link you bookmarked will no longer work.
