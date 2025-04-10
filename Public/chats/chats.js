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


    userDiv.onclick = async () => {
  selectedReceiverId = user.id;
  highlightSelected(user.id);

  // Clear chat body
  const chatBody = document.querySelector(".chat-body");
  chatBody.innerHTML = "";

  // Load last 20 messages
  const response = await axios.get(
    `http://localhost:3000/chats/history/${user.id}?limit=20`,
    { headers: headers }
  );

  const messages = response.data.messages;
  const currentUserId = getCurrentUserId();

  messages.forEach((msg) => {
    const who = msg.sender_id === currentUserId ? "me" : "them";
    appendMessage(who, msg.message);
  });
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

  
  if (
    data.senderId !== currentUserId &&
    data.senderId === selectedReceiverId
  ) {
    appendMessage("them", data.message);
  }
});


//groups

async function openModal(event) {
  event.preventDefault();
  // console.log("openModal called");
  document.getElementById("groupModal").classList.remove("hidden");

  const response = await axios.get("http://localhost:3000/user/users", { headers: headers });
  const users = response.data.users;
  const currentUserId = getCurrentUserId();

  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach(user => {
    if (user.id === currentUserId) return;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = user.id;

    const label = document.createElement("label");
    label.textContent = user.username;

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);

    userList.appendChild(div);
  });
}

function closeModal() {
  // console.log("closeModal called");

 document.getElementById("groupModal").classList.add("hidden");
}
  
async function submitGroup() {
    const group_name = document.getElementById("groupName").value;
    const checkboxes = document.querySelectorAll("#userList input:checked");
    const members = [...checkboxes].map(cb => parseInt(cb.value));
  
    try {
      await axios.post("http://localhost:3000/groups/create", {
        group_name,
        members
      }, { headers: headers });
  
      alert("Group created!");
      closeModal();
    } catch (err) {
      console.error("Group creation failed:", err);
      alert("Error creating group");
    }
}


async function loadGroups() {

  try {
    
    const response = await axios.get("http://localhost:3000/groups/getGroups", { headers: headers});
    const groups = response.data.groups;
    console.log("groups from backend:", response.data.groups);


    if (!groups || groups.length === 0) {
      console.log("No groups found for this user.");
      return;
    }

    const container = document.querySelector(".chat-items");


    groups.forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.classList.add("chat-user");  // You can style differently if needed
      groupDiv.textContent = group.group_name;
      groupDiv.setAttribute("data-group-id", group.id);

      // groupDiv.onclick = () => { /* load group messages in future */ }

      container.appendChild(groupDiv);
    });
  } catch (error) {
    console.error("Error loading groups:", error);
    
  }
}

  window.onload = () => {
    loadUsers();
    loadGroups()
  };
  