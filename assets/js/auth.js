document.addEventListener('DOMContentLoaded', function() {
    const authLinks = document.getElementById('auth-links');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- Authentication State Observer ---
    auth.onAuthStateChanged(user => {
        updateNav(user);
        if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
            window.location.href = 'booking.html';
        }
    });

    // --- Update Navigation based on Auth State ---
    function updateNav(user) {
        // **FIX:** Check if the authLinks element exists before trying to modify it.
        if (authLinks) {
            if (user) {
                authLinks.innerHTML = `
                    <a href="booking.html" class="text-purple-600 font-semibold hover:underline">My Appointments</a>
                    <button id="logout-btn" class="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Logout</button>
                `;
            } else {
                authLinks.innerHTML = `
                    <a href="login.html" class="text-purple-600 font-semibold hover:underline">Login</a>
                    <a href="signup.html" class="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Sign Up</a>
                `;
            }
        }

        // **FIX:** Check if the mobileMenu element exists before trying to modify it.
        if (mobileMenu) {
            if (user) {
                mobileMenu.innerHTML = `
                    <a href="index.html" class="block py-2">Home</a>
                    <a href="about.html" class="block py-2">About</a>
                    <a href="services.html" class="block py-2">Services</a>
                    <a href="contact.html" class="block py-2">Contact</a>
                    <hr>
                    <a href="booking.html" class="block py-2">My Appointments</a>
                    <button id="mobile-logout-btn" class="w-full mt-2 bg-purple-600 text-white text-center px-6 py-2 rounded-full">Logout</button>
                `;
                document.getElementById('mobile-logout-btn').addEventListener('click', logout);
            } else {
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

        // Add logout listener for desktop view if user is logged in
        if (user) {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        }
    }

    // --- Signup Functionality ---
    if (window.location.pathname.includes('signup.html')) {
        const signupForm = document.querySelector('form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = signupForm.name.value;
                const email = signupForm.email.value;
                const password = signupForm.password.value;

                auth.createUserWithEmailAndPassword(email, password)
                    .then(cred => {
                        return db.collection('users').doc(cred.user.uid).set({ name: name });
                    })
                    .then(() => {
                        alert('Account created successfully!');
                    })
                    .catch(err => {
                        alert(err.message);
                    });
            });
        }
    }

    // --- Login Functionality ---
    if (window.location.pathname.includes('login.html')) {
        const loginForm = document.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.email.value;
                const password = loginForm.password.value;

                auth.signInWithEmailAndPassword(email, password)
                    .catch(err => {
                        alert(err.message);
                    });
            });
        }
    }

    // --- Logout Functionality ---
    function logout() {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});