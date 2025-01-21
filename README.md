# **DomBookApp**
*A Simple Book Management Application*

---

## **Project Overview**
DomBookApp is a lightweight book management application built with **HTML**, **CSS**, and **JavaScript**, leveraging a deployed **JSON server** as the backend. This app caters to two user roles: **Admin** and **User**, providing functionalities for managing books and borrowing them.

The project is structured into three key pages:
1. **Login Page (`index.html`)**
2. **Admin Management Page (`admin.html`)**
3. **User Book Page (`books.html`)**

The app is deployed for public use and supports data persistence through a JSON server.

---

## **Features**
### General Features
- Shared navigation bar across all pages for seamless navigation.
- Secure login system for Admin and User roles.
- Data validation and user role-specific actions.

### Admin Features
- Add new books with fields like title, author, category, and availability.
- View books in a grid layout with options to:
  - Verify books.
  - Delete books.
- Persistent updates to the backend.

### User Features
- View all available books for borrowing.
- Borrow books by specifying the borrowing duration (up to 10 days).
- Return borrowed books, updating their availability status.
- Data updates synced with the backend.

---

## **Page Structure**

### **1. Login Page (`index.html`)**
The entry point of the application.

#### **Login Credentials**
- **Admin Login**
  - Email: `admin@empher.com`
  - Password: `empher@123`

- **User Login**
  - Email: `user@empher.com`
  - Password: `user@123`

#### **Features**
- Validates login credentials.
- Redirects users based on roles:
  - **Admin** → Redirected to `admin.html` with an alert: *"Logged in as Admin."*
  - **User** → Redirected to `books.html` with an alert: *"Logged in as User."*
- Stores user data in `localStorage` under the key `loginData`.
- Displays error messages for incorrect credentials.

---

### **2. Admin Management Page (`admin.html`)**
Accessible only to Admin users. Unauthorized users are redirected to the Login page with an alert: *"Admin Not Logged In."*

#### **Features**
1. **Add New Books**  
   - Form fields: Title, Author, Category (Fiction, Comedy, Technical).
   - Sends a `POST` request to the backend to add the book.
   - Displays an alert: *"Book Added Successfully."*

2. **View and Manage Books**  
   - Displays books in a grid layout (4 books per row).
   - Each book card contains:
     - Title, Author, Category, Availability Status, and Borrowed Days.
   - **Actions**:
     - **Verify Book**  
       - Prompts: *"Are you sure to Verify..?"*
       - Updates the `isVerified` status to `true` via a `PATCH` request.
       - Disables the Verify button upon confirmation.
       - Updates the UI.
     - **Delete Book**  
       - Prompts: *"Are you sure to Delete..?"*
       - Deletes the book using a `DELETE` request.
       - Updates the UI.

---

### **3. User Book Page (`books.html`)**
Accessible only to User accounts. Unauthorized users are redirected to the Login page with an alert: *"User Not Logged In."*

#### **Features**
1. **Show Available Books**  
   - Fetches and displays books with `isAvailable: true` via a `GET` request.
   - Each book card includes:
     - Title, Author, Category, and Availability.
   - **Borrow Book**:
     - Prompts for borrowing duration (up to 10 days).
     - Updates the `borrowedDays` and `isAvailable` status via a `PATCH` request.
     - Displays an alert: *"Book Borrowed Successfully."*
     - Updates the UI.

2. **Show Borrowed Books**  
   - Fetches and displays books with `isAvailable: false` via a `GET` request.
   - Each book card includes:
     - Title, Author, Category, and Borrowed Days.
   - **Return Book**:
     - Prompts: *"Are you sure to return book..?"*
     - Resets `borrowedDays` to `null` and updates `isAvailable` to `true` via a `PATCH` request.
     - Displays an alert: *"Book Returned Successfully."*
     - Updates the UI.

---

## **Backend**
The app uses a deployed **JSON server** to handle data operations.

### **Base URL**
```
https://amused-twilight-beast.glitch.me/books
```

### **Book Object Structure**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "category": "Fiction",
  "isAvailable": true,
  "isVerified": false,
  "borrowedDays": null,
  "imageUrl": "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg"
}
```

### **Supported Categories**
- Fiction
- Comedy
- Technical

---


## **How to Run Locally**
1. Clone the repository:
   ```bash
   git clone https://github.com/Priyankanegi28/DomBookApp.git
   ```
2. Navigate to the project directory:
   ```bash
   cd DomBookApp
   ```
3. Open `index.html` in your browser to start the app.

---

## **Screenshots**
(Add screenshots for Login Page, Admin Page, and User Book Page.)

---

## **Technologies Used**
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: JSON Server
- **Hosting**: GitHub Pages

---

## **License**
This project is licensed under the MIT License.

---
