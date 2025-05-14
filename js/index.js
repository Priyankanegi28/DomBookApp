// Initialize users array if not exists
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([
        {
            name: "Admin",
            email: "admin@empher.com",
            password: "empher@123",
            isAdmin: true
        }
    ]));
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("login-error-message");

    // Reset error message
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    // Simple validation
    if (!email || !password) {
        errorMessage.textContent = "Please fill in all fields";
        errorMessage.style.display = "block";
        return;
    }

    // Check credentials
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store login data
        localStorage.setItem("loginData", JSON.stringify({ 
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false
        }));
        
        showSuccessAlert(`Welcome back, ${user.name || 'User'}!`);
        
        // Redirect based on role
        setTimeout(() => {
            window.location.href = user.isAdmin ? "admin.html" : "books.html";
        }, 1500);
    } else {
        errorMessage.textContent = "Invalid credentials. Please try again.";
        errorMessage.style.display = "block";
        document.getElementById("loginForm").classList.add("shake");
        setTimeout(() => {
            document.getElementById("loginForm").classList.remove("shake");
        }, 500);
    }
});

// Registration form handling
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    const errorMessage = document.getElementById("register-error-message");

    // Reset error message
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        errorMessage.textContent = "Please fill in all fields";
        errorMessage.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = "Password must be at least 6 characters";
        errorMessage.style.display = "block";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match";
        errorMessage.style.display = "block";
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) {
        errorMessage.textContent = "Email already registered";
        errorMessage.style.display = "block";
        return;
    }

    // Create new user
    const newUser = {
        name,
        email,
        password, // In a real app, you would hash this
        isAdmin: false
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Auto-login the new user
    localStorage.setItem("loginData", JSON.stringify({ 
        email: newUser.email,
        name: newUser.name,
        isAdmin: false
    }));
    
    showSuccessAlert(`Welcome to DomBookApp, ${name}!`);
    setTimeout(() => {
        window.location.href = "books.html";
    }, 1500);
});

function showSuccessAlert(message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "floating-alert success";
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
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