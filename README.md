# 🩺 Medical Records Manager – Contributor Guide

## 📄 Project Description
The **Medical Records Manager** is a secure web application designed to simplify healthcare record management. It enables doctors to issue and share prescriptions directly with designated patients, ensuring quick and confidential access to medical information.

Patients can log in to view their prescriptions, treatment history, and other essential health records anytime, anywhere. The platform supports additional features such as appointment scheduling, diagnostic report sharing, and streamlined doctor–patient communication.

Built with a focus on **security**, **accessibility**, and **ease of use**, this application helps healthcare providers improve efficiency while ensuring patient data remains private and compliant with medical standards.

---

## 🚀 Contribution Workflow
Every time you work on this project:

1. **Pull the latest code from `main`**  
   Always start by syncing your local copy with the remote main branch.
2. **Work in your own branch**  
   Your branch should be named after your own name or GitHub username.
3. **Commit your changes**  
   Keep commits meaningful and related to a single task or fix.
4. **Push your branch to GitHub**
5. **Create a Pull Request (PR)**  
   The PR should be from **your branch** → **`main` branch**.  
   Add a clear comment describing what you have done.

---

## 🛠 Step-by-Step Guide

### 1️⃣ Clone the Repository (First Time Only)

- git clone https://github.com/<your-org>/<repo-name>.git
- cd <repo-name>

### 2️⃣ Pull the Latest Code Before You Start

- git checkout main
- git pull origin main

#####  Run this after cloning (Each Time)
- npm install

### 3️⃣ Create and Switch to Your Personal Branch

- git checkout -b your-name
    (Replace your-name with your actual branch name.)

### 4️⃣ Make Your Changes

    Edit, add, or delete files as needed.

    Test your changes locally.

### 5️⃣ Stage and Commit Your Changes

- git add .
- git commit -m "Brief description of what you changed"

### 6️⃣ Push Your Branch to GitHub

- git push origin your-name
    (Replace your-name with your actual branch name.)

### 7️⃣ Create a Pull Request (PR)

    Go to the repository on GitHub.

    Click Compare & pull request.

    Ensure the PR is from your branch → main.

    In the PR description, clearly state:

        What you changed

        Why you changed it

        Any testing or screenshots

### 📌 Best Practices

    Never work directly on the main branch.

    Pull from main often to avoid merge conflicts.

    Use clear, concise commit messages.

    Keep branches focused on one feature or fix at a time.
