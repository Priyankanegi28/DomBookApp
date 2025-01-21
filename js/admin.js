const backendUrl = "https://amused-twilight-beast.glitch.me";

const loginData = JSON.parse(localStorage.getItem("loginData"));
if (!loginData || loginData.email !== "admin@empher.com") {
    alert("Admin Not Logged In");
    window.location.href = "index.html";
}

document.getElementById("addBookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const categoryInput = document.getElementById("category");

    const title = titleInput.value;
    const author = authorInput.value;
    const category = categoryInput.value;

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
        await fetch(`${backendUrl}/books/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBook),
        });

        alert("Book Added Successfully");

        // Clear the input fields and set default category to "Fiction"
        titleInput.value = "";
        authorInput.value = "";
        categoryInput.value = "Fiction";

        loadBooks();
    } catch (error) {
        alert("Failed to add book. Please try again.");
    }
});

async function loadBooks() {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = '<p>Loading books...</p>'; // Show a quick loading message

    try {
        const response = await fetch(`${backendUrl}/books?limit=20`); // Limit the number of books fetched
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        bookList.innerHTML = '<p>Failed to load books. Please try again later.</p>';
    }
}

function renderBooks(books) {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = ""; // Clear the loading message

    const fragment = document.createDocumentFragment(); // Use a fragment for faster DOM updates

    books.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";

        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Category: ${book.category}</p>
            <p>Status: ${book.isAvailable ? "Available" : "Borrowed"}</p>
        `;

        const verifyButton = document.createElement("button");
        verifyButton.textContent = "Verify Book";
        if (book.isVerified) verifyButton.disabled = true;
        verifyButton.addEventListener("click", () => verifyBook(book.id));
        bookCard.appendChild(verifyButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Book";
        deleteButton.addEventListener("click", () => deleteBook(book.id));
        bookCard.appendChild(deleteButton);

        fragment.appendChild(bookCard);
    });

    bookList.appendChild(fragment); // Append the entire fragment to the DOM at once
}

async function verifyBook(id) {
    if (confirm("Are you sure to Verify..?")) {
        try {
            await fetch(`${backendUrl}/books/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: true }),
            });

            alert("Book Verified Successfully");
            loadBooks();
        } catch (error) {
            alert("Failed to verify book. Please try again.");
        }
    }
}

async function deleteBook(id) {
    if (confirm("Are you sure to Delete..?")) {
        try {
            await fetch(`${backendUrl}/books/${id}`, { method: "DELETE" });

            alert("Book Deleted Successfully");
            loadBooks();
        } catch (error) {
            alert("Failed to delete book. Please try again.");
        }
    }
}

loadBooks();
