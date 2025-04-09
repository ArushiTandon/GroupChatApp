const socket = io();
const apiUrl = "http://localhost:3000/chats";
const token = localStorage.getItem("authToken");
const headers = {
  ["x-auth-token"]: `Bearer ${token}`,
};

let selectedReceiverId = null;

async function sendMessage(event) {
  event.preventDefault();

  const message = event.target.message.value;
  const receiver_id = selectedReceiverId;

  if (!selectedReceiverId) {
    alert("Please select a user to send the message.");
    return;
  }


  try {
    const response = await axios.post(
      `${apiUrl}/send`,
      { receiver_id, message },
      { headers: headers }
    );
    // console.log("Message Response:", response.data);
    // alert(response.data.message);

    const currentUserId = getCurrentUserId();

    socket.emit("send_message", {
    message: message,
    senderId: currentUserId,
    });

    appendMessage("me", message);

  } catch (error) {
    alert("Unable to send message:", error);
  }

  event.target.reset();
}

function getCurrentUserId() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    return decodedPayload.id;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
}

function appendMessage(who, message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", who === "me" ? "from-me" : "from-them");
    msgDiv.textContent = message;
    document.querySelector(".chat-body").appendChild(msgDiv);
}

  
async function loadUsers() {
  try {

    const response = await axios.get(
        `http://localhost:3000/user/users`,
        { headers: headers }
      );

    const users = response.data.users;
    const container = document.querySelector(".chat-items");
    container.innerHTML = "";

    users.forEach(user => {
      const userDiv = document.createElement("div");
      userDiv.classList.add("chat-user");
      userDiv.textContent = user.username;
      userDiv.setAttribute("data-id", user.id);
      userDiv.onclick = () => {              
        selectedReceiverId = user.id;      
        highlightSelected(user.id);   
      };
      container.appendChild(userDiv);
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

function highlightSelected(userId) {
  // Remove highlight from all users
  document.querySelectorAll(".chat-user").forEach(el => {
    el.classList.remove("selected-user");
  });

  // Find the user with matching data-id and highlight it
  const selected = [...document.querySelectorAll(".chat-user")].find(
    el => el.getAttribute("data-id") == userId
  );

  if (selected) {
    selected.classList.add("selected-user");
  }
}

socket.on("receive_message", (data) => {
  const currentUserId = getCurrentUserId();

  
  if (data.senderId !== currentUserId) {
    appendMessage("them", data.message);
  }
});



  window.onload = () => {
    loadUsers();
  };
  