const socket = io();
const apiUrl = "http://localhost:3000/chats";
const token = localStorage.getItem("authToken");
const headers = {
  ["x-auth-token"]: `Bearer ${token}`,
};

let selectedReceiverId = null;
let selectedGroupId = null;
let currentInviteGroupId = null;
let currentManageGroupId = null;

async function sendMessage(event) {
  event.preventDefault();

  const message = event.target.message.value;
  const fileInput = document.getElementById("mediaFile");
  const file = fileInput.files[0];
  const currentUserId = getCurrentUserId();
  let mediaUrl = null; // Using a local variable here

  try {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      // Notice: letting Axios set the Content-Type automatically.
      const uploadResponse = await axios.post(
        "http://localhost:3000/chats/upload", // backend route to handle file upload
        formData,
        { headers }
      );

      mediaUrl = uploadResponse.data.fileUrl;
      fileInput.value = ""; // Reset file input after successful upload
    }

    // Group message handling
    if (selectedGroupId) {
      socket.emit("send_group_message", {
        groupId: selectedGroupId,
        message,
        senderId: currentUserId,
        mediaUrl,
      });
      appendMessage("me", message, mediaUrl);

    // Private (one-on-one) message handling
    } else if (selectedReceiverId) {
      await axios.post(
        `${apiUrl}/send`,
        { receiver_id: selectedReceiverId, message, mediaUrl },
        { headers }
      );

      // Include mediaUrl in socket emission for private messages, if desired.
      socket.emit("send_message", {
        message,
        senderId: currentUserId,
        mediaUrl, 
      });

      appendMessage("me", message, mediaUrl);
    } else {
      alert("Select a user or group to send a message.");
    }
    event.target.reset(); // Reset the entire form
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message. Please try again.");
  }
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
        highlightSelected(user.id, "user");

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

function highlightSelected(id, type = "user") {
  // Remove highlight from all users and groups
  document.querySelectorAll(".chat-user").forEach(el => {
    el.classList.remove("selected-user");
  });

  // Get correct attribute
  const attr = type === "user" ? "data-id" : "data-group-id";

  const selected = [...document.querySelectorAll(".chat-user")].find(
    el => el.getAttribute(attr) == id
  );

  if (selected) {
    selected.classList.add("selected-user");
  }
}


socket.on("receive_group_message", (data) => {
  const currentUserId = getCurrentUserId();

  if (
    data.groupId === selectedGroupId &&
    data.senderId !== currentUserId
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

    const response = await axios.get("http://localhost:3000/groups/getGroups", { headers: headers });
    const groups = response.data.groups;
    // console.log("groups from backend:", response.data.groups);


    if (!groups || groups.length === 0) {
      console.log("No groups found for this user.");
      return;
    }

    const container = document.querySelector(".chat-items");
    // container.innerHTML = "";

    
    
    groups.forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.classList.add("chat-user");
      groupDiv.textContent = group.group_name;
      groupDiv.setAttribute("data-group-id", group.id);

      console.log("GROUPPPP: ",group.id, group.is_admin)
      groupDiv.onclick = async () => {
        selectedGroupId = group.id;
        selectedReceiverId = null;
        highlightSelected(group.id, "group");
        renderAdminControls(group.id, group.is_admin);
        document.querySelector(".chat-body").innerHTML = "";


        // currentGroupId
        // console.log(response.data.messages);
        // console.log("Selected Group ID:", group.id);


        // group chat history 

        try {
          const response = await axios.get(
            `http://localhost:3000/groups/messages/${group.id}`,
            { headers: headers }
          );

          const messages = response.data.messages;
          const currentUserId = getCurrentUserId();

          messages.forEach(msg => {
            const who = msg.user_id === currentUserId ? "me" : "them";
            appendMessage(who, `${msg.User.username}: ${msg.message}`);
          });
        } catch (err) {
          console.error("Error loading group chat history:", err);
        }
      };

      const inviteBtn = document.createElement("button");
      inviteBtn.textContent = "➕ Invite";
      inviteBtn.onclick = () => openInviteModal(group.id);


      groupDiv.appendChild(inviteBtn);
      container.appendChild(groupDiv);
    });

    const groupIds = groups.map(g => g.id);
    socket.emit("join_groups", groupIds);
  } catch (error) {
    console.error("Error loading groups:", error);

  }
}

function renderAdminControls(groupId, isAdmin) {
  const chatHeader = document.querySelector(".chat-header");
  chatHeader.innerHTML = ""; // Clear previous controls

  if (isAdmin) {
    const inviteBtn = document.createElement("button");
    inviteBtn.textContent = "Invite User";
    inviteBtn.onclick = () => openInviteModal(groupId);

    const manageBtn = document.createElement("button");
    manageBtn.textContent = "Manage Members";
    manageBtn.onclick = () => openManageModal(groupId);

    chatHeader.appendChild(inviteBtn);
    chatHeader.appendChild(manageBtn);
  }
}


async function openInviteModal(groupId) {
  currentInviteGroupId = groupId;
  document.getElementById("inviteModal").classList.remove("hidden");

  try {
    // Fetch users not in group
    const response = await axios.get(`http://localhost:3000/groups/nonmembers/${groupId}`, {
      headers
    });

    const users = response.data.users;
    const userList = document.getElementById("inviteUserList");
    userList.innerHTML = "";

    users.forEach(user => {
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

  } catch (err) {
    console.error("Error fetching non-members:", err);
    alert("Failed to load users.");
    closeInviteModal();
  }
}

function closeInviteModal() {
  document.getElementById("inviteModal").classList.add("hidden");
  currentInviteGroupId = null;
}

async function submitInvites() {
  const checkboxes = document.querySelectorAll("#inviteUserList input:checked");
  const userIds = [...checkboxes].map(cb => parseInt(cb.value));

  try {
    await axios.post(`http://localhost:3000/groups/invite/${currentInviteGroupId}`, {
      userIds
    }, { headers: headers });

    alert("Users invited to group!");
    closeInviteModal();
  } catch (err) {
    console.error("Error inviting users:", err);
    alert("Error sending invites.");
  }
}

async function openManageModal(groupId) {
  currentManageGroupId = groupId;
  document.getElementById("manageModal").classList.remove("hidden");

  try {
    const response = await axios.get(`http://localhost:3000/groups/members/${groupId}`, {
      headers
    });

    const members = response.data.members;
    const currentUserId = getCurrentUserId();
    const memberList = document.getElementById("memberList");
    memberList.innerHTML = "";

    members.forEach(member => {
      const div = document.createElement("div");
      div.classList.add("member-item");
      div.textContent = `${member.username} ${member.is_admin ? "👑" : ""}`;

      // Promote to admin button
      if (!member.is_admin) {
        const promoteBtn = document.createElement("button");
        promoteBtn.textContent = "Make Admin";
        promoteBtn.dataset.userId = member.userId;
        promoteBtn.addEventListener("click", () => {
          const userId = promoteBtn.dataset.userId;
          makeAdmin(groupId, userId); 
        });
        
        div.appendChild(promoteBtn);
      }

      // Remove button (don't allow removing yourself)
      if (member.id !== currentUserId) {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.dataset.userId = member.userId;
        removeBtn.addEventListener("click", () => {
          const userId = removeBtn.dataset.userId;
          removeMember(groupId, userId); 
        });
        div.appendChild(removeBtn);
      }

      memberList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading group members:", err);
    alert("Failed to load members");
    closeManageModal();
  }
}

function closeManageModal() {
  document.getElementById("manageModal").classList.add("hidden");
  currentManageGroupId = null;
}

async function makeAdmin(groupId, userId) {
  try {
    await axios.patch(`http://localhost:3000/groups/make-admin/${groupId}/${userId}`, null, {
      headers: headers
    });

    alert("User promoted to admin!");
    openManageModal(groupId); // Refresh list
  } catch (err) {
    console.error("Error promoting user:", err);
    alert("Failed to promote");
  }
}

async function removeMember(groupId, userId) {
  try {
    await axios.delete(`http://localhost:3000/groups/remove-member/${groupId}/${userId}`, {
      headers
    });
    alert("User removed from group.");
    openManageModal(groupId); // Refresh list
    loadGroups(); // Refresh group list in sidebar
  } catch (err) {
    console.error("Error removing user:", err);
    alert("Failed to remove user");
  }
}

window.onload = () => {
  loadUsers();
  loadGroups()
};
