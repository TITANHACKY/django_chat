from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("<int:user_id>", views.chat, name="chat"),
]