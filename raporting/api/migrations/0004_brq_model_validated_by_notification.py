# Generated by Django 5.0 on 2024-05-01 16:55

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_remove_customuser_mail_remove_customuser_nom_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='brq_model',
            name='validated_by',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('brq', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.brq_model')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
