const backendUrl = "https://amused-twilight-beast.glitch.me";

// Check authentication
const loginData = JSON.parse(localStorage.getItem("loginData"));
if (!loginData || !loginData.email) {
    showAlert("Please login to view your profile", "error");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// DOM Elements
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const totalBorrowed = document.getElementById("total-borrowed");
const currentBorrowed = document.getElementById("current-borrowed");
const currentBooksList = document.getElementById("current-books-list");
const historyList = document.getElementById("history-list");
const settingsForm = document.getElementById("settings-form");
const logoutBtn = document.getElementById("logout-btn");
const navLinks = document.getElementById("nav-links");

// Admin email (in a real app, this would come from your backend or config)
const ADMIN_EMAIL = "admin@dombookapp.com";

// Check if user is admin and update navbar
function checkAdminStatus() {
    if (loginData.email === ADMIN_EMAIL) {
        const adminLink = document.createElement("a");
        adminLink.href = "admin.html";
        adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
        
        // Insert before the Books link
        const booksLink = document.querySelector('a[href="books.html"]');
        if (booksLink) {
            booksLink.parentNode.insertBefore(adminLink, booksLink);
        } else {
            // Fallback if books link isn't found
            const profileLink = document.querySelector('a[href="profile.html"]');
            if (profileLink) {
                profileLink.parentNode.insertBefore(adminLink, profileLink);
            }
        }
    }
}

// Tab functionality
document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Load profile data
async function loadProfile() {
    try {
        // First check admin status
        checkAdminStatus();
        
        // In a real app, you would fetch user data from your backend
        // For now we'll use localStorage and mock data
        const user = getUserData(loginData.email);
        
        profileName.textContent = user.name || "User";
        profileEmail.textContent = loginData.email;
        
        // Load user's books
        const response = await fetch(`${backendUrl}/books`);
        if (!response.ok) throw new Error("Failed to fetch books");
        
        const allBooks = await response.json();
        const userBooks = allBooks.filter(book => 
            !book.isAvailable && book.borrowedBy === loginData.email
        );
        
        const returnedBooks = JSON.parse(localStorage.getItem(`userHistory_${loginData.email}`)) || [];
        
        // Update stats
        totalBorrowed.textContent = returnedBooks.length + userBooks.length;
        currentBorrowed.textContent = userBooks.length;
        
        // Display current books
        displayCurrentBooks(userBooks);
        
        // Display history
        displayHistory(returnedBooks);
        
        // Populate settings form
        if (settingsForm) {
            document.getElementById("settings-name").value = user.name || "";
            document.getElementById("settings-email").value = loginData.email;
        }
        
    } catch (error) {
        showAlert("Failed to load profile data. Please try again.", "error");
        console.error("Error loading profile:", error);
    }
}

// Rest of your existing JavaScript functions remain the same...
// (displayCurrentBooks, displayHistory, returnBook, addToHistory, etc.)

// Initialize

// Display currently borrowed books
function displayCurrentBooks(books) {
    if (books.length === 0) {
        currentBooksList.innerHTML = '<div class="text-center">You have no books currently borrowed.</div>';
        return;
    }

    currentBooksList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.className = "card";
        bookCard.innerHTML = `
            <div class="card-img">
                <img src="${book.imageUrl}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            </div>
            <div class="card-body">
                <h3 class="card-title">${book.title}</h3>
                <p class="card-text"><i class="fas fa-user"></i> ${book.author}</p>
                <p class="card-text"><i class="fas fa-calendar-alt"></i> Due in ${calculateDueDays(book.borrowedDate)} days</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary return-btn" data-id="${book.id}">
                    <i class="fas fa-undo"></i> Return Book
                </button>
            </div>
        `;
        fragment.appendChild(bookCard);
    });

    currentBooksList.appendChild(fragment);

    // Add event listeners to return buttons
    document.querySelectorAll(".return-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            await returnBook(bookId);
        });
    });
}

// Display borrowing history
function displayHistory(history) {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center">Your borrowing history is empty.</div>';
        return;
    }

    historyList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    history.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        
        const statusClass = item.returnedLate ? "status-late" : "status-returned";
        const statusText = item.returnedLate ? "Returned Late" : "Returned";
        
        historyItem.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-title">${item.title}</div>
                <div class="history-item-meta">
                    <span><i class="fas fa-user"></i> ${item.author}</span>
                    <span><i class="fas fa-calendar-day"></i> ${formatDate(item.borrowedDate)}</span>
                    <span><i class="fas fa-calendar-check"></i> ${formatDate(item.returnedDate)}</span>
                </div>
            </div>
            <span class="history-item-status ${statusClass}">${statusText}</span>
        `;
        fragment.appendChild(historyItem);
    });

    historyList.appendChild(fragment);
}

// Return book function
async function returnBook(bookId) {
    if (confirm("Are you sure you want to return this book?")) {
        try {
            // Get book details first
            const bookResponse = await fetch(`${backendUrl}/books/${bookId}`);
            if (!bookResponse.ok) throw new Error("Failed to fetch book details");
            
            const book = await bookResponse.json();
            
            // Update book status
            const updateResponse = await fetch(`${backendUrl}/books/${bookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    isAvailable: true,
                    borrowedBy: null,
                    borrowedDate: null
                }),
            });

            if (!updateResponse.ok) throw new Error("Failed to return book");
            
            // Add to history
            addToHistory(book);
            
            showAlert("Book returned successfully", "success");
            loadProfile();
        } catch (error) {
            showAlert("Failed to return book. Please try again.", "error");
            console.error("Error returning book:", error);
        }
    }
}

// Add book to user's history
function addToHistory(book) {
    const history = JSON.parse(localStorage.getItem(`userHistory_${loginData.email}`)) || [];
    
    const returnedDate = new Date().toISOString();
    const borrowedDate = book.borrowedDate || new Date().toISOString();
    const dueDate = new Date(borrowedDate);
    dueDate.setDate(dueDate.getDate() + (book.borrowedDays || 7));
    
    history.unshift({
        id: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        borrowedDate: borrowedDate,
        returnedDate: returnedDate,
        returnedLate: new Date(returnedDate) > dueDate
    });
    
    localStorage.setItem(`userHistory_${loginData.email}`, JSON.stringify(history));
}

// Update user settings
if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("settings-name").value.trim();
        const password = document.getElementById("settings-password").value;
        const confirmPassword = document.getElementById("settings-confirm-password").value;
        
        if (password && password !== confirmPassword) {
            showAlert("Passwords do not match", "error");
            return;
        }
        
        try {
            // In a real app, you would send this to your backend
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex(u => u.email === loginData.email);
            
            if (userIndex !== -1) {
                users[userIndex].name = name;
                if (password) {
                    users[userIndex].password = password; // In real app, hash this
                }
                localStorage.setItem("users", JSON.stringify(users));
            }
            
            showAlert("Profile updated successfully", "success");
            loadProfile();
        } catch (error) {
            showAlert("Failed to update profile. Please try again.", "error");
            console.error("Error updating profile:", error);
        }
    });
}

// Logout function
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loginData");
        showAlert("Logged out successfully", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    });
}

// Helper functions
function calculateDueDays(borrowedDate) {
    if (!borrowedDate) return 7;
    const dueDate = new Date(borrowedDate);
    dueDate.setDate(dueDate.getDate() + 7); // 7-day borrowing period
    const diff = dueDate - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getUserData(email) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users.find(u => u.email === email) || { email };
}

function showAlert(message, type) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `floating-alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add("show");
    }, 10);
    
    setTimeout(() => {
        alertDiv.classList.remove("show");
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 3000);
}

// Initialize
loadProfile();