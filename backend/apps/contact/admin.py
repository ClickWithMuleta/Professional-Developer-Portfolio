from django.contrib import admin
from django.utils.html import format_html, escape
from django.utils.translation import gettext_lazy as _
from .models import ContactMessage
from .email_service import send_contact_notification


# ---------------------------------------------------------------------------
# Custom Admin Actions
# ---------------------------------------------------------------------------

@admin.action(description="Mark selected messages as Read")
def mark_as_read(modeladmin, request, queryset):
    updated = queryset.update(is_read=True)
    modeladmin.message_user(request, f"{updated} message(s) marked as read.")


@admin.action(description="Mark selected messages as Unread")
def mark_as_unread(modeladmin, request, queryset):
    updated = queryset.update(is_read=False)
    modeladmin.message_user(request, f"{updated} message(s) marked as unread.")


@admin.action(description="Resend Email Notification to Admin for selected messages")
def resend_email_notification(modeladmin, request, queryset):
    success_count = 0
    fail_count = 0
    for message in queryset:
        if send_contact_notification(message):
            ContactMessage.objects.filter(pk=message.pk).update(email_sent=True)
            success_count += 1
        else:
            fail_count += 1

    if success_count > 0:
        modeladmin.message_user(
            request,
            f"Successfully dispatched notification email for {success_count} message(s)."
        )
    if fail_count > 0:
        modeladmin.message_user(
            request,
            f"Failed to send email for {fail_count} message(s). Check server email settings.",
            level='warning'
        )


# ---------------------------------------------------------------------------
# ContactMessage Admin
# ---------------------------------------------------------------------------

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """
    Admin panel for inbound contact form submissions.

    Security & Convenience:
      - All sender inputs are strictly read-only to prevent accidental edits
      - Status pill: Unread (amber) vs Read (emerald)
      - Email delivery pill: Sent (blue) vs Not Dispatched (red)
      - Quick 'Reply via Email' action link
      - Action to resend notification emails if SMTP was temporarily down
    """
    list_display = (
        'review_status_pill',
        'email_status_pill',
        'sender_name',
        'sender_email',
        'subject',
        'message_snippet',
        'created_at',
    )
    list_filter = (
        'is_read',
        'email_sent',
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'sender_name',
        'sender_email',
        'subject',
        'message_body',
        'ip_address',
    )
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    actions = (mark_as_read, mark_as_unread, resend_email_notification)

    readonly_fields = (
        'review_status_pill',
        'email_status_pill',
        'reply_action_button',
        'sender_name',
        'sender_email',
        'subject',
        'message_body_formatted',
        'ip_address',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Message Status & Action', {
            'fields': (
                ('is_read', 'email_sent'),
                'reply_action_button',
            )
        }),
        ('Sender Information', {
            'fields': (
                'sender_name',
                'sender_email',
                'ip_address',
            )
        }),
        ('Inquiry Content', {
            'fields': (
                'subject',
                'message_body_formatted',
            )
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def has_add_permission(self, request):
        """Contact messages originate only through the public API form, never manual admin entry."""
        return False

    @admin.display(description="Status", ordering='is_read')
    def review_status_pill(self, obj):
        if obj.is_read:
            return format_html(
                '<span style="background:#064e3b;color:#34d399;padding:3px 8px;'
                'border-radius:12px;font-size:11px;font-weight:600;">Read</span>'
            )
        return format_html(
            '<span style="background:#78350f;color:#fbbf24;padding:3px 8px;'
            'border-radius:12px;font-size:11px;font-weight:700;">★ New / Unread</span>'
        )

    @admin.display(description="Email Dispatched", ordering='email_sent')
    def email_status_pill(self, obj):
        if obj.email_sent:
            return format_html(
                '<span style="background:#1e3a8a;color:#93c5fd;padding:2px 7px;'
                'border-radius:10px;font-size:11px;font-weight:600;">Sent</span>'
            )
        return format_html(
            '<span style="background:#450a0a;color:#fca5a5;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">Not Sent</span>'
        )

    @admin.display(description="Message Preview")
    def message_snippet(self, obj):
        snippet = obj.message_body[:70]
        if len(obj.message_body) > 70:
            snippet += "..."
        return escape(snippet)

    @admin.display(description="Message Body")
    def message_body_formatted(self, obj):
        return format_html(
            '<div style="background:#18181b;color:#f4f4f5;padding:16px;'
            'border-radius:6px;font-family:sans-serif;font-size:13px;line-height:1.6;'
            'white-space:pre-wrap;border:1px solid #27272a;">{}</div>',
            obj.message_body
        )

    @admin.display(description="Quick Reply")
    def reply_action_button(self, obj):
        return format_html(
            '<a href="mailto:{}?subject=Re: {}" style="background:#10b981;color:#fff;'
            'padding:8px 16px;border-radius:4px;font-weight:600;text-decoration:none;'
            'display:inline-block;font-size:13px;">✉ Reply to {} via Email ↗</a>',
            obj.sender_email, obj.subject, obj.sender_name
        )
