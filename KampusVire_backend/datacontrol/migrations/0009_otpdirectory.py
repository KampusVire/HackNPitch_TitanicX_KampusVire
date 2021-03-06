# Generated by Django 3.2.6 on 2021-09-15 19:04

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('datacontrol', '0008_auto_20210915_1847'),
    ]

    operations = [
        migrations.CreateModel(
            name='OtpDirectory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('token', models.TextField(null=True)),
                ('otp', models.IntegerField(null=True)),
                ('phone_no', models.FloatField(null=True)),
                ('is_used', models.BooleanField(default=False, null=True)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
