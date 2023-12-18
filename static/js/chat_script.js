//Content Loaded
import chatSocket from "./sock.js";

window.addEventListener("DOMContentLoaded", (e) => {
  var header = document.querySelector(".header");
  var chatRoom = document.querySelector(".chat-room");
  var typeArea = document.querySelector(".type-area");
  var btnAdd = document.querySelector(".button-add");
  var others = document.querySelector(".others");
  var emojiBox = document.querySelector(".emoji-button .emoji-box");
  var emojiButton = document.querySelector(".others .emoji-button");
  var emojis = document.querySelectorAll(".emoji-box span");
  var inputText = document.querySelector("#inputText");
  var btnSend = document.querySelector(".button-send");
  //Header onclick event
  header.addEventListener("click", (e) => {
    if (typeArea.classList.contains("d-none")) {
      header.style.borderRadius = "20px 20px 0 0";
    } else {
      header.style.borderRadius = "20px";
    }
    typeArea.classList.toggle("d-none");
    chatRoom.classList.toggle("d-none");
  });
  //Button Add onclick event
  btnAdd.addEventListener("click", (e) => {
    others.classList.add("others-show");
  });
  //Emoji onclick event
  emojiButton.addEventListener("click", (e) => {
    emojiBox.classList.add("emoji-show");
  });
  //Button Send onclick event
  btnSend.addEventListener("click", (e) => {
    var mess=inputText.value;
    if(mess==="") return;
    var message = document.createElement("div");
    message.className += " message message-right";
    var bubble=document.createElement('div');
    bubble.className+=" bubble bubble-dark";
    bubble.innerHTML=mess.replace(/\n/g, '<br>');
    message.appendChild(bubble);
    chatRoom.appendChild(message);
    inputText.value="";
    chatRoom.scrollTop=chatRoom.scrollHeight;
    const sender_id = JSON.parse(document.getElementById('sender_id').textContent);
    const receiver_id = JSON.parse(document.getElementById('receiver_id').textContent);
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': mess,
        'sender_id': sender_id,
        'receiver_id': receiver_id
    }));
  });
  for (var emoji of emojis) {
    emoji.addEventListener("click", (e) => {
      e.stopPropagation();
      emojiBox.classList.remove("emoji-show");
      others.classList.remove("others-show");
      inputText.value+=e.target.textContent;
    });
  }
});


chatSocket.onmessage = function (response) {
    const receiver_id = JSON.parse(document.getElementById('receiver_id').textContent);
    const sender_id = JSON.parse(document.getElementById('sender_id').textContent);
    const data = JSON.parse(response.data);
    if(data.type === 'message') {
        if (data.sender_id === receiver_id && data.sender_id !== sender_id) {
            var chatRoom = document.querySelector(".chat-room");
            var mess = data.message;
            var message = document.createElement("div");
            message.className += " message message-left";
            var bubble = document.createElement('div');
            bubble.className += " bubble bubble-light";
            bubble.innerHTML = mess.replace(/\n/g, '<br>');
            message.appendChild(bubble);
            chatRoom.appendChild(message);
            chatRoom.scrollTop = chatRoom.scrollHeight;
            chatSocket.send(
                JSON.stringify({
                    'type': "read_message",
                    'sender_id': JSON.parse(document.getElementById('sender_id').textContent),
                    'receiver_id': JSON.parse(document.getElementById('receiver_id').textContent)
                })
            )
        } else {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            } else if (Notification.permission === 'granted') {
                new Notification(data.sender_name, {
                    body: data.message,
                    tag: data.sender_id,
                })
            }
        }
    }
    else if (data.type === 'inside_chat') {
        if (data.sender_id === receiver_id) {
            if ($("#inside-chat").length === 0 && data.sender_id !== sender_id) {
                let header = $(".header");
                header[0].innerHTML += '<span class="inside-chat" id="inside-chat">In the Chat</span>';
                chatSocket.send(
                    JSON.stringify({
                        'type': "inside_chat",
                        'sender_id': JSON.parse(document.getElementById('sender_id').textContent),
                        'receiver_id': JSON.parse(document.getElementById('receiver_id').textContent)
                    })
                )
            }
        } else {
            chatSocket.send(
                JSON.stringify({
                    'type': "outside_chat",
                    'sender_id': JSON.parse(document.getElementById('sender_id').textContent),
                    'receiver_id': JSON.parse(document.getElementById('receiver_id').textContent)
                })
            )
        }
    } else if (data.type === 'outside_chat') {
        if (data.sender_id === receiver_id && data.sender_id !== sender_id) {
            let insideChat = $("#inside-chat");
            insideChat[0].remove();
    }
        }
}

$('document').ready(function(){
    var chatRoom = document.querySelector(".chat-room");
    chatRoom.scrollTop = chatRoom.scrollHeight;
    chatSocket.addEventListener('open', function (event) {
        chatSocket.send(
            JSON.stringify({
                'type': "inside_chat",
                'sender_id': JSON.parse(document.getElementById('sender_id').textContent),
                'receiver_id': JSON.parse(document.getElementById('receiver_id').textContent)
            })
        )
        window.history.pushState({}, null, null);
    });

    window.addEventListener('beforeunload', function (event) {
        console.log("here")
        chatSocket.send(
            JSON.stringify({
                'type': "outside_chat",
                'sender_id': JSON.parse(document.getElementById('sender_id').textContent),
                'receiver_id': JSON.parse(document.getElementById('receiver_id').textContent)
            })
        )
    });

});