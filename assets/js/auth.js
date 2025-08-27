document.addEventListener('DOMContentLoaded', function () {
    const authLinks = document.getElementById('auth-links');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- Authentication State Observer ---
    auth.onAuthStateChanged(user => {
        updateNav(user);
        // Redirect logged-in users away from login/signup pages
        if (user && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html'))) {
            window.location.href = 'booking.html';
        }
    });

    // --- Update Navigation based on Auth State ---
    function updateNav(user) {
        // This function remains the same as before. It correctly shows
        // Login/Signup or Logout/My Appointments based on user state.
        if (user) {
            authLinks.innerHTML = `
                <a href="booking.html" class="text-purple-600 font-semibold hover:underline">My Appointments</a>
                <button id="logout-btn" class="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Logout</button>
            `;
            mobileMenu.innerHTML = `
                <a href="index.html" class="block py-2">Home</a>
                <a href="about.html" class="block py-2">About</a>
                <a href="services.html" class="block py-2">Services</a>
                <a href="contact.html" class="block py-2">Contact</a>
                <hr>
                <a href="booking.html" class="block py-2">My Appointments</a>
                <button id="mobile-logout-btn" class="w-full mt-2 bg-purple-600 text-white text-center px-6 py-2 rounded-full">Logout</button>
            `;
            // Ensure logout buttons are always clickable after being added
            document.getElementById('logout-btn').addEventListener('click', logout);
            document.getElementById('mobile-logout-btn').addEventListener('click', logout);
        } else {
            authLinks.innerHTML = `
                <a href="login.html" class="text-purple-600 font-semibold hover:underline">Login</a>
                <a href="signup.html" class="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Sign Up</a>
            `;
            mobileMenu.innerHTML = `
                <a href="index.html" class="block py-2">Home</a>
                <a href="about.html" class="block py-2">About</a>
                <a href="services.html" class="block py-2">Services</a>
                <a href="contact.html" class="block py-2">Contact</a>
                <hr>
                <a href="login.html" class="block py-2">Login</a>
                <a href="signup.html" class="block mt-2 bg-purple-600 text-white text-center px-6 py-2 rounded-full">Sign Up</a>
            `;
        }
    }

    // --- Signup Functionality ---
    // **FIX:** Target the form specifically on the signup page
    if (window.location.pathname.endsWith('signup.html')) {
        const signupForm = document.querySelector('form');
        signupForm.addEventListener('submit', (e) => {
            // **FIX:** This is the most important line. It stops the page from reloading.
            e.preventDefault();

            const name = signupForm.name.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    return db.collection('users').doc(cred.user.uid).set({
                        name: name
                    }).then(() => {
                        console.log('User signed up and profile created');
                        // Redirect happens after successful signup
                    });
                })
                .catch(err => {
                    alert(err.message);
                });
        });
    }

    // --- Login Functionality ---
    // **FIX:** Target the form specifically on the login page
    if (window.location.pathname.endsWith('login.html')) {
        const loginForm = document.querySelector('form');
        loginForm.addEventListener('submit', (e) => {
            // **FIX:** This stops the page from reloading.
            e.preventDefault();

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            auth.signInWithEmailAndPassword(email, password)
                .then(cred => {
                    console.log('User logged in');
                    // Redirect is handled by the onAuthStateChanged observer
                })
                .catch(err => {
                    alert(err.message);
                });
        });
    }

    // --- Logout Functionality ---
    function logout() {
        auth.signOut().then(() => {
            console.log('User signed out');
            window.location.href = "index.html";
        });
    }

    // --- Mobile Menu Toggle ---
    // This was missing but is needed for the mobile menu button to work
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});