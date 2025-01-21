document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email= document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");


    if (email === "admin@empher.com" && password === "empher@123") {
        localStorage.setItem("loginData" , JSON.stringify({ email }));
        alert("Logged in as Admin");
        window.location.href = "admin.html";
    } 
    else if (email === "user@empher.com" && password === "user@123") {
        localStorage.setItem("loginData", JSON.stringify({ email }));
        alert("Logged in as User");
        window.location.href = "books.html";
    } 
    else {
        errorMessage.textContent = "Invalid credentials";
    }
});