const apiUrl = "http://localhost:3000/user";

async function login(event) {
    event.preventDefault();
    
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const response = await axios.post(`${apiUrl}/login`, { email, password });
        console.log('Login Response:', response.data);

        if (response.status === 200) {
            console.log("User logged in successfully");
            alert(response.data.message);

            const token = response.data.token;
            localStorage.setItem('authToken', token);

            // window.location.href = "/home";
        }
          
    } catch (error) {
        console.error("Unable to Login:", error);
    }

    event.target.reset();
}