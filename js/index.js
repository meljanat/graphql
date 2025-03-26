function checkAuth() {
    const jwt = localStorage.getItem("jwt");

    if (jwt) {
        window.location.href = "profile.html";
    }
}
checkAuth();

document.getElementById('Login').addEventListener('submit', (event) => {
    event.preventDefault()
    const userVal = document.getElementById('username').value;
    const passwordVal = document.getElementById('password').value;

    login(userVal, passwordVal);
});


async function login(username, password) {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("jwt", data);
        window.location.href = "profile.html";
    } else {
        alert(data.error)
    }
}

