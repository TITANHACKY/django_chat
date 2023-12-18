# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User

from chat.models import Chat


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.room_group_name = f"chat_{self.user_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        receiver_group_name = f"chat_{text_data_json['receiver_id']}"
        if text_data_json['type'] == "message" and text_data_json.get("message"):
            Chat.objects.create(
                sender_id=text_data_json["sender_id"],
                receiver_id=text_data_json["receiver_id"],
                message=text_data_json["message"],
            )
            sender_name = User.objects.get(id=text_data_json["sender_id"]).username
            async_to_sync(self.channel_layer.group_send)(
                receiver_group_name, {"type": "message", "message": text_data_json["message"], "sender_id": text_data_json["sender_id"], "sender_name": sender_name}
            )
        elif text_data_json['type'] == "inside_chat":
            Chat.objects.filter(sender_id=text_data_json["receiver_id"],
                                receiver_id=text_data_json["sender_id"]).update(is_read=True)
            async_to_sync(self.channel_layer.group_send)(
                receiver_group_name, {"type": "inside_chat", "sender_id": text_data_json["sender_id"]}
            )
        elif text_data_json['type'] == "outside_chat":
            async_to_sync(self.channel_layer.group_send)(
                receiver_group_name, {"type": "outside_chat", "sender_id": text_data_json["sender_id"]}
            )
        elif text_data_json['type'] == "typing":
            async_to_sync(self.channel_layer.group_send)(
                receiver_group_name, {"type": "typing", "sender_id": text_data_json["sender_id"]}
            )
        elif text_data_json['type'] == "not_typing":
            async_to_sync(self.channel_layer.group_send)(
                receiver_group_name, {"type": "not_typing", "sender_id": text_data_json["sender_id"]}
            )

    def message(self, event):
        self.send(text_data=json.dumps(event))

    def inside_chat(self, event):
        self.send(text_data=json.dumps(event))

    def outside_chat(self, event):
        self.send(text_data=json.dumps(event))

    def typing(self, event):
        self.send(text_data=json.dumps(event))

    def not_typing(self, event):
        self.send(text_data=json.dumps(event))