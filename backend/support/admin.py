from django.contrib import admin
from .models import SupportTicket

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('subject', 'message', 'user__username', 'user__email')
    readonly_fields = ('user', 'subject', 'message', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Ticket Info', {
            'fields': ('user', 'subject', 'message', 'status', 'created_at', 'updated_at')
        }),
        ('Admin Response', {
            'fields': ('admin_reply',)
        }),
    )

    def has_add_permission(self, request):
        return False # Users create tickets via API, not admin panel
