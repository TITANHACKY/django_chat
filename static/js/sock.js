// sock.js

const user_id = JSON.parse(document.getElementById('sender_id').textContent);
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + user_id
);

chatSocket.onmessage = function (response) {
    const receiver_id = JSON.parse(document.getElementById('receiver_id').textContent);
    const data = JSON.parse(response.data);
    if (data.sender_id === receiver_id && data.receiver_id !== data.sender_id) {
        var chatRoom = document.querySelector(".chat-room");
        var mess = data.message;
        var message = document.createElement("div");
        message.className += " message message-left";
        var bubble = document.createElement('div');
        bubble.className += " bubble bubble-light";
        bubble.textContent = mess;
        message.appendChild(bubble);
        chatRoom.appendChild(message);
        chatRoom.scrollTop = chatRoom.scrollHeight;
    } else {
        if(Notification.permission === 'default') {
            Notification.requestPermission();
        } else if(Notification.permission === 'granted') {
            new Notification(data.sender_name, {
                body: data.message,
                tag: data.sender_id,
            })
        }
    }
}

export default chatSocket;
