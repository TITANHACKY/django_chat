from django.db.models import Q, Count
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Chat


def home(request):
    users = User.objects.all()
    users = users.annotate(
        unread_message_count=Count('sent_messages__id', filter=Q(sent_messages__is_read=False, sent_messages__is_deleted=False, sent_messages__receiver=request.user), distinct=True)
    )
    return render(request, 'home.html', {'users': users})

def chat(request, user_id):
    user = User.objects.get(id=user_id)
    chats = Chat.objects.filter(sender=request.user, receiver=user) | Chat.objects.filter(sender=user, receiver=request.user)
    chats = chats.order_by('timestamp')
    return render(request, 'chat.html', {'chats': chats, 'user': user})