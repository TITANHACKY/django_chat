from django.db import models

# Create your models here.
class Chat(models.Model):
    sender = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.message