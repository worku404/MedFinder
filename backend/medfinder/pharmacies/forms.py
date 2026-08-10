from django import forms

class PharmacyRejectionForm(forms.Form):
    rejection_reason = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 4, "cols": 60, "style": "width: 100%; max-width: 600px;"}),
        required=True,
        help_text="This reason will be saved on each pharmacy and emailed to the respective owners.",
    )