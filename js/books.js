const loginData = JSON.parse(localStorage.getItem('loginData'));
if(!loginData || loginData.email !== 'user@empher.com') {
    alert('User not logged in');
    window.location.href='index.html';
}
document.getElementById('showAvailableBooks').addEventListener('click', async function(){
    const response =await fetch('https://amused-twilight-beast.glitch.me/books?isAvailable=true');
    const books = await response.json();
    displayBooks(books);
});
document.getElementById('showBorrowedBooks').addEventListener('click',async function (){
    const response= await fetch('https://amused-twilight-beast.glitch.me/books?isAvailable=false');
    const books= await response.json();
    displayBooks(books);
});
function displayBooks(books){
    const bookList = document.getElementById('bookList');
    bookList.innerHTML='';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Category: ${book.category}</p>
        <p>Status: ${book.isAvailable ? 'Available' : 'Borrowed'}</p>
        ${book.isAvailable
            ? `<button onclick = "borrowBook(${book.id})">Borrow Book</button>`
            : `<button onclick ="returnBook(${book.id})">Return Book</button>`
        }
        `;
        bookList.appendChild(bookCard);
    });

}

async function borrowBook(id){
    const days= prompt('Enter borrowing duration(max 10 days):');
    if (days >0 && days <=10){
        await fetch(`https://amused-twilight-beast.glitch.me/books/${id}`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({isAvailable:false, borrowedDays:days}),
        });
        alert('Book borrowed successfully');
        document.getElementById('showAvailableBooks').click();
    } else {
        alert('Invalid duration ');
    }
}

async function returnBook(id){
    if(confirm('are you sure?')) {
        await fetch(`https://amused-twilight-beast.glitch.me/books/${id}`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({isAvailable:true, borrowedDays:null }),
        });
        alert('book returned');
        document.getElementById('showBorrowedBooks').click();
    }
}
