document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const currentPage = window.location.pathname;

    // --- Guest/Unauthenticated users ---
    if (!user) {
        const allowedGuestPages = ['/', '/index.html', '/login.html'];
        if (!allowedGuestPages.some(page => currentPage.endsWith(page))) {
            window.location.href = 'login.html';
            return; // Stop further execution
        }
    }

    // --- Authenticated users ---
    if (user) {
        // Redirect logged-in users from the login page, regardless of role
        if (currentPage.endsWith('/login.html')) {
            window.location.href = 'index.html';
            return; // Stop further execution
        }

        // --- Role-based access control for authenticated users ---
        const userRole = user.role || 'user'; // Default to 'user' if role is not defined

        // Admins have access to all pages, so no checks needed for them.
        // We only check for non-admin roles.
        if (userRole === 'user') {
            const userAllowedPages = [
                '/',
                '/index.html',
                '/view-survey.html',
                '/take-survey.html'
            ];
            if (!userAllowedPages.some(page => currentPage.endsWith(page))) {
                alert('You do not have permission to access this page.');
                window.location.href = 'index.html'; // Redirect to a safe page
                return;
            }
        }
    }

    // --- UI updates for Login/Logout buttons ---
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const signupButton = document.getElementById('signup-button');

    if (user) {
        // User is logged in
        if(loginButton) loginButton.style.display = 'none';
        if(signupButton) signupButton.style.display = 'none';
        if(logoutButton) logoutButton.style.display = 'block';
    } else {
        // User is not logged in
        if(loginButton) loginButton.style.display = 'block';
        if(signupButton) signupButton.style.display = 'block';
        if(logoutButton) logoutButton.style.display = 'none';
    }

    // --- Logout functionality ---
    if(logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html'; // Redirect to login page after logout
        });
    }
});
