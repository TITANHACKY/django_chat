from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    path(r"ws/chat/<int:user_id>", consumers.ChatConsumer.as_asgi()),
]