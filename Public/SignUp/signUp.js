const apiUrl = "http://localhost:3000/user";

async function signUp(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const email = event.target.email.value;
    const phone = event.target.phone.value;
    const password = event.target.password.value;

    const user = { username, email, phone, password }

    try {
      const response =  await axios.post(`${apiUrl}/signup`, user);
        // console.log("User created successfully");
        alert(response.data.message);
        
    } catch (error) {
        console.error("Unable to SignUp:", error);
    }

    event.target.reset();
}