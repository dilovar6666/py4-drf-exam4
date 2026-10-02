from django.db import migrations


def mark_existing_users_verified(apps, schema_editor):
    apps.get_model("accounts", "CustomUser").objects.all().update(is_email_verified=True)


class Migration(migrations.Migration):
    dependencies = [("accounts", "0003_customuser_is_email_verified_emailverificationcode")]
    operations = [migrations.RunPython(mark_existing_users_verified, migrations.RunPython.noop)]
