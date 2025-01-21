const backendUrl = "https://amused-twilight-beast.glitch.me";

const loginData = JSON.parse(localStorage.getItem('loginData'));
if (!loginData || loginData.email !== 'user@empher.com') {
    alert('User Not Logged In');
    window.location.href = 'index.html';
}

document.getElementById('showAvailableBooks').addEventListener('click', async function () {
    try {
        const response = await fetch(`${backendUrl}/books?isAvailable=true`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        alert('Failed to fetch available books. Please try again later.');
    }
});

document.getElementById('showBorrowedBooks').addEventListener('click', async function () {
    try {
        const response = await fetch(`${backendUrl}/books?isAvailable=false`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        alert('Failed to fetch borrowed books. Please try again later.');
    }
});

function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Category: ${book.category}</p>
            <p>Status: ${book.isAvailable ? 'Available' : `Borrowed (${book.borrowedDays} days)`}</p>
            <button>${book.isAvailable ? 'Borrow Book' : 'Return Book'}</button>
        `;
        
        const button = bookCard.querySelector('button');
        button.addEventListener('click', () => {
            if (book.isAvailable) {
                borrowBook(book.id);
            } else {
                returnBook(book.id);
            }
        });

        bookList.appendChild(bookCard);
    });
}

async function borrowBook(id) {
    const days = prompt('Enter borrowing duration (max 10 days):');
    if (days > 0 && days <= 10) {
        try {
            await fetch(`${backendUrl}/books/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: false, borrowedDays: parseInt(days, 10) }),
            });

            alert('Book Borrowed Successfully');
            document.getElementById('showAvailableBooks').click();
        } catch (error) {
            alert('Failed to borrow the book. Please try again.');
        }
    } else {
        alert('Invalid duration');
    }
}

async function returnBook(id) {
    if (confirm('Are you sure to return the book?')) {
        try {
            await fetch(`${backendUrl}/books/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: true, borrowedDays: null }),
            });

            alert('Book Returned Successfully');
            document.getElementById('showBorrowedBooks').click();
        } catch (error) {
            alert('Failed to return the book. Please try again.');
        }
    }
}
