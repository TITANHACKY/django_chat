import chatSocket from "./sock.js";

chatSocket.onmessage = function (response) {
    const data = JSON.parse(response.data);
    console.log(data)
    if(data.type === 'message'){
        let chat_count = $("#user-"+data.sender_id+"-unread-message-count");
        if (chat_count.length > 0) {
            chat_count.text(parseInt(chat_count.text()) + 1);
        } else {
            $("#user-"+data.sender_id+"-name")[0].innerHTML += '<span class="unread-message-count" id="user-'+data.sender_id+'-unread-message-count">1</span>';
        }
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