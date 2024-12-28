const loginData = JSON.parse(localStorage.getItem('loginData'));
if(!loginData || loginData.email !== 'admin@empher.com') {
    alert('Admin Not Logged In');
    window.Location.href = 'index.html';
}

document.getElementById('addBookForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const category = document.getElementById('category').value;

    const newBook = {
        title,
        author,
        category,
        isAvailable: true,
        isVerified: false,
        borrowedDays: null,
        imageUrl: 'https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg',
    };
    await fetch('https://amused-twilight-beast.glitch.me/books', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newBook),
    });

    alert('Book Added Successfully');
    loadBooks();
});

async function loadBooks(){
    const response = await fetch('https://amused-twilight-beast.glitch.me/books');
    const books = await response.json();

    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Category: ${book.category}</p>
        <p>Status: ${book.isAvailable ? 'Available' : 'Borrowed'}</p>
        <button> ${book.isVerified ? 'disabled' : ''} onclick="verifyBook(${book.id})">Verify Book</button>
        <button onclick="deleteBook(${book.id})">Delete Book</button>
        `;
        bookList.appendChild(bookCard);
    });
}
async function verifyBook(id) {
    if(confirm('Are you sure to verify..?')) {
        await fetch(`https://amused-twilight-beast.glitch.me/books/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'apllication/json'},
            body: JSON.stringify({isVerified: true}),
        });

        alert('Book Verified Successfully');
        loadBooks();
    }
}

async function deleteBook(id) {
    if(confirm('Are you sure to Delete..?')){
        await fetch (`https://amused-twilight-beast.glitch.me/books/${id}`,{method: 'DELETE'});
        alert('Book Deleted Successfully');
        loadBooks();
    }
}

loadBooks();