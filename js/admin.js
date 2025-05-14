const backendUrl = "https://amused-twilight-beast.glitch.me";

// Check admin authentication
const loginData = JSON.parse(localStorage.getItem("loginData"));
if (!loginData || !loginData.isAdmin) {
    showAlert("Admin access required", "error");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// [Rest of the admin.js code remains the same as before...]
// (Include all the other functions: showAlert, loadBooks, renderBooks, verifyBook, deleteBook)

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

// Add new book
addBookForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const category = document.getElementById("category").value;

    if (!title || !author) {
        showAlert("Please fill in all fields", "error");
        return;
    }

    const newBook = {
        title,
        author,
        category,
        isAvailable: true,
        isVerified: false,
        borrowedDays: null,
        imageUrl: "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg",
    };

    try {
        const response = await fetch(`${backendUrl}/books/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBook),
        });

        if (!response.ok) throw new Error("Failed to add book");

        showAlert("Book Added Successfully", "success");
        addBookForm.reset();
        document.getElementById("category").value = "Fiction";
        loadBooks();
    } catch (error) {
        showAlert("Failed to add book. Please try again.", "error");
        console.error("Error adding book:", error);
    }
});

// Load all books
async function loadBooks() {
    bookList.innerHTML = '<div class="text-center">Loading books...</div>';

    try {
        const response = await fetch(`${backendUrl}/books`);
        if (!response.ok) throw new Error("Failed to fetch books");
        
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        bookList.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Failed to load books. Please try again later.</div>';
        console.error("Error loading books:", error);
    }
}

// Render books
function renderBooks(books) {
    if (books.length === 0) {
        bookList.innerHTML = '<div class="text-center">No books found. Add some books to get started.</div>';
        return;
    }

    bookList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    books.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "card";
        bookCard.innerHTML = `
            <div class="card-img">
                <img src="${book.imageUrl}" alt="${book.title}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${book.title}</h3>
                <p class="card-text"><i class="fas fa-user"></i> ${book.author}</p>
                <p class="card-text"><i class="fas fa-tag"></i> ${book.category}</p>
                <span class="card-status ${book.isAvailable ? 'status-available' : 'status-borrowed'}">
                    ${book.isAvailable ? 'Available' : 'Borrowed'}
                </span>
                ${book.borrowedDays ? `<p class="card-text"><i class="fas fa-calendar-alt"></i> ${book.borrowedDays} days</p>` : ''}
            </div>
            <div class="card-footer">
                <button class="btn ${book.isVerified ? 'btn-secondary' : 'btn-success'} btn-sm verify-btn" 
                    data-id="${book.id}" ${book.isVerified ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> ${book.isVerified ? 'Verified' : 'Verify'}
                </button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${book.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        fragment.appendChild(bookCard);
    });

    bookList.appendChild(fragment);

    // Add event listeners to all verify buttons
    document.querySelectorAll(".verify-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            verifyBook(bookId);
        });
    });

    // Add event listeners to all delete buttons
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            deleteBook(bookId);
        });
    });
}

// Verify book
async function verifyBook(id) {
    if (confirm("Are you sure you want to verify this book?")) {
        try {
            const response = await fetch(`${backendUrl}/books/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: true }),
            });

            if (!response.ok) throw new Error("Failed to verify book");

            showAlert("Book Verified Successfully", "success");
            loadBooks();
        } catch (error) {
            showAlert("Failed to verify book. Please try again.", "error");
            console.error("Error verifying book:", error);
        }
    }
}

// Delete book
async function deleteBook(id) {
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
        try {
            const response = await fetch(`${backendUrl}/books/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Failed to delete book");

            showAlert("Book Deleted Successfully", "success");
            loadBooks();
        } catch (error) {
            showAlert("Failed to delete book. Please try again.", "error");
            console.error("Error deleting book:", error);
        }
    }
}

// Initial load
loadBooks();