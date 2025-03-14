# Generated by Django 5.0.6 on 2024-11-25 09:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_cart_thumbnail_pdffile_category_pdffile_keywords_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='editedpdftemplate',
            name='imageUrl',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='editedpdftemplate',
            name='pdfType',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='pdffile',
            name='upload_image_path',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='editedpdftemplate',
            name='embedded_pages',
            field=models.TextField(null=True),
        ),
    ]
