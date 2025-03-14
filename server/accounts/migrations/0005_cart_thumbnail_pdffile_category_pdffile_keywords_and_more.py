# Generated by Django 5.0.6 on 2024-11-08 09:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_pdffile_uploaded_at'),
        ('login', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cart',
            name='thumbnail',
            field=models.URLField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='pdffile',
            name='category',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='pdffile',
            name='keywords',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='pdffile',
            name='name',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.CreateModel(
            name='EditedPdfTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('embedded_pages', models.TextField()),
                ('title_name', models.CharField(default='', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pdf', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.pdffile')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='login.customuser')),
            ],
        ),
        migrations.CreateModel(
            name='SessionLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('link', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_links', to='login.customuser')),
            ],
        ),
    ]
