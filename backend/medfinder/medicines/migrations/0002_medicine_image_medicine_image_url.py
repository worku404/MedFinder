from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medicines', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='medicine',
            name='image',
            field=models.ImageField(
                blank=True,
                help_text='Uploaded packaging image',
                null=True,
                upload_to='medicine_images/',
            ),
        ),
        migrations.AddField(
            model_name='medicine',
            name='image_url',
            field=models.URLField(
                blank=True,
                help_text='Optional external image link (e.g. CDN or catalog URL)',
                max_length=500,
                null=True,
            ),
        ),
    ]
