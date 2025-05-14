const backendUrl = "https://amused-twilight-beast.glitch.me";

// Check authentication
const loginData = JSON.parse(localStorage.getItem("loginData"));
if (!loginData || !loginData.email) {
    showAlert("Please login to access books", "error");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// DOM Elements
const showAvailableBooksBtn = document.getElementById("showAvailableBooks");
const showBorrowedBooksBtn = document.getElementById("showBorrowedBooks");
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categoryFilter = document.getElementById("categoryFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortOptions = document.getElementById("sortOptions");
const logoutBtn = document.getElementById("logout-btn");

// State variables
let currentBooks = [];
let currentView = 'available';
let currentFilters = {
    searchTerm: '',
    category: '',
    availability: '',
    sortOption: 'title-asc'
};

// Initialize the page
init();

function init() {
    // Set up event listeners
    showAvailableBooksBtn.addEventListener("click", () => loadBooks(true));
    showBorrowedBooksBtn.addEventListener("click", () => loadBooks(false));
    searchBtn.addEventListener("click", applySearch);
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') applySearch();
    });
    categoryFilter.addEventListener("change", applyFilters);
    availabilityFilter.addEventListener("change", applyFilters);
    sortOptions.addEventListener("change", applyFilters);
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
    
    // Load initial data
    loadBooks(true);
}

function logoutUser() {
    localStorage.removeItem("loginData");
    showAlert("Logged out successfully", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// Load books from API
async function loadBooks(showAvailable) {
    try {
        currentView = showAvailable ? 'available' : 'borrowed';
        let url = `${backendUrl}/books?isAvailable=${showAvailable}`;
        
        // For borrowed books, only show books borrowed by current user
        if (!showAvailable) {
            url += `&borrowedBy=${loginData.email}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Failed to fetch ${currentView} books`);
        
        currentBooks = await response.json();
        applyFilters();
        
        // Update active button state
        if (showAvailable) {
            showAvailableBooksBtn.classList.add('active');
            showBorrowedBooksBtn.classList.remove('active');
        } else {
            showAvailableBooksBtn.classList.remove('active');
            showBorrowedBooksBtn.classList.add('active');
        }
    } catch (error) {
        showAlert(`Failed to fetch ${currentView} books. Please try again.`, "error");
        console.error(`Error fetching ${currentView} books:`, error);
    }
}

// [Rest of the books.js code remains the same as before...]
// (Include all the other functions: showAlert, applySearch, applyFilters, filterBooks, sortBooks, displayBooks, handleBookAction, borrowBook, returnBook)

// Show alert function
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

// Load books from API
async function loadBooks(showAvailable) {
    try {
        currentView = showAvailable ? 'available' : 'borrowed';
        const url = `${backendUrl}/books?isAvailable=${showAvailable}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Failed to fetch ${currentView} books`);
        
        currentBooks = await response.json();
        applyFilters();
        
        // Update active button state
        if (showAvailable) {
            showAvailableBooksBtn.classList.add('active');
            showBorrowedBooksBtn.classList.remove('active');
        } else {
            showAvailableBooksBtn.classList.remove('active');
            showBorrowedBooksBtn.classList.add('active');
        }
    } catch (error) {
        showAlert(`Failed to fetch ${currentView} books. Please try again.`, "error");
        console.error(`Error fetching ${currentView} books:`, error);
    }
}

// Apply search filters
function applySearch() {
    currentFilters.searchTerm = searchInput.value.trim();
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    currentFilters.category = categoryFilter.value;
    currentFilters.availability = availabilityFilter.value;
    currentFilters.sortOption = sortOptions.value;
    
    const filteredBooks = filterBooks(currentBooks, currentFilters);
    const sortedBooks = sortBooks(filteredBooks, currentFilters.sortOption);
    
    displayBooks(sortedBooks);
}

// Filter books based on criteria
function filterBooks(books, filters) {
    return books.filter(book => {
        // Search term filter
        const matchesSearch = !filters.searchTerm || 
            book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
            book.author.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        // Category filter
        const matchesCategory = !filters.category || book.category === filters.category;
        
        // Availability filter (more relevant for 'borrowed' view)
        let matchesAvailability = true;
        if (currentView === 'available' && filters.availability === 'borrowed') {
            matchesAvailability = false; // Shouldn't happen since we're in available view
        } else if (currentView === 'borrowed' && filters.availability === 'available') {
            matchesAvailability = false; // Shouldn't happen since we're in borrowed view
        }
        
        return matchesSearch && matchesCategory && matchesAvailability;
    });
}

// Sort books based on option
function sortBooks(books, sortOption) {
    const sortedBooks = [...books];
    
    switch(sortOption) {
        case 'title-asc':
            return sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
            return sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
        case 'newest':
            // Assuming newer books have higher IDs
            return sortedBooks.sort((a, b) => b.id - a.id);
        case 'most-borrowed':
            // Using borrowedDays as a proxy for popularity
            return sortedBooks.sort((a, b) => (b.borrowedDays || 0) - (a.borrowedDays || 0));
        default:
            return sortedBooks;
    }
}

// Display books in the UI
function displayBooks(books) {
    if (books.length === 0) {
        bookList.innerHTML = `
            <div class="text-center">
                No ${currentView === 'available' ? 'available' : 'borrowed'} books found 
                matching your criteria.
            </div>
        `;
        return;
    }

    bookList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    books.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "card";
        bookCard.innerHTML = `
            <div class="card-img">
                <img src="${book.imageUrl}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            </div>
            <div class="card-body">
                <h3 class="card-title">${book.title}</h3>
                <p class="card-text"><i class="fas fa-user"></i> ${book.author}</p>
                <p class="card-text"><i class="fas fa-tag"></i> ${book.category}</p>
                <span class="card-status ${book.isAvailable ? 'status-available' : 'status-borrowed'}">
                    ${book.isAvailable ? 'Available' : 'Borrowed'}
                </span>
                ${book.borrowedDays ? `<p class="card-text"><i class="fas fa-calendar-alt"></i> Borrowed for ${book.borrowedDays} days</p>` : ''}
            </div>
            <div class="card-footer">
                <button class="btn ${book.isAvailable ? 'btn-primary' : 'btn-success'} action-btn" 
                    data-id="${book.id}" data-available="${book.isAvailable}">
                    <i class="fas ${book.isAvailable ? 'fa-bookmark' : 'fa-undo'}"></i> 
                    ${book.isAvailable ? 'Borrow Book' : 'Return Book'}
                </button>
            </div>
        `;
        fragment.appendChild(bookCard);
    });

    bookList.appendChild(fragment);

    // Add event listeners to all action buttons
    document.querySelectorAll(".action-btn").forEach(button => {
        button.addEventListener("click", handleBookAction);
    });
}

// Handle borrow/return actions
function handleBookAction(e) {
    const bookId = e.currentTarget.getAttribute("data-id");
    const isAvailable = e.currentTarget.getAttribute("data-available") === "true";
    
    if (isAvailable) {
        borrowBook(bookId);
    } else {
        returnBook(bookId);
    }
}

// Borrow book function
async function borrowBook(id) {
    const days = prompt("Enter borrowing duration (1-10 days):");
    if (!days || isNaN(days) || days < 1 || days > 10) {
        showAlert("Please enter a valid duration between 1 and 10 days", "error");
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/books/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                isAvailable: false, 
                borrowedDays: parseInt(days, 10),
                lastBorrowedDate: new Date().toISOString() // Add borrowing timestamp
            }),
        });

        if (!response.ok) throw new Error("Failed to borrow book");

        showAlert("Book Borrowed Successfully", "success");
        loadBooks(currentView === 'available');
    } catch (error) {
        showAlert("Failed to borrow book. Please try again.", "error");
        console.error("Error borrowing book:", error);
    }
}

// Return book function
async function returnBook(id) {
    if (confirm("Are you sure you want to return this book?")) {
        try {
            const response = await fetch(`${backendUrl}/books/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    isAvailable: true, 
                    borrowedDays: null,
                    lastReturnedDate: new Date().toISOString() // Add return timestamp
                }),
            });

            if (!response.ok) throw new Error("Failed to return book");

            showAlert("Book Returned Successfully", "success");
            loadBooks(currentView === 'available');
        } catch (error) {
            showAlert("Failed to return book. Please try again.", "error");
            console.error("Error returning book:", error);
        }
    }
}