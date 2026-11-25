from django.db import models
from apps.core.models import TimeStampedModel


class ContactMessage(TimeStampedModel):
    """
    Inbound contact form submission from portfolio visitors.

    Captures sender metadata and message content.
    The `is_read` flag allows tracking review status in Django admin.
    IP address is stored for basic spam/abuse review only — not shared publicly.

    Inherits `created_at` and `updated_at` from TimeStampedModel.
    """
    sender_name = models.CharField(
        max_length=120,
        help_text="Full name of the sender as entered in the contact form."
    )
    sender_email = models.EmailField(
        help_text="Contact email address for follow-up."
    )
    subject = models.CharField(
        max_length=200,
        help_text="Brief subject line of the inquiry."
    )
    message_body = models.TextField(
        help_text="Full message content submitted through the contact form."
    )
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        help_text="Originating IP address. Used for spam review only."
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Marks whether this message has been reviewed in the admin panel."
    )
    email_sent = models.BooleanField(
        default=False,
        help_text=(
            "Whether the email notification was successfully dispatched. "
            "False does not mean the message was lost — it is always saved first."
        )
    )

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender_name} — {self.subject}"
