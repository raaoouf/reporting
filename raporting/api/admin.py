from django.contrib import admin
from .models import Brq_model, Role, Unit, Etulisateur, UserRole, NatureAi,CustomUser, Notification
# Register your models here.

admin.site.register(Brq_model)
admin.site.register(Role)
admin.site.register(Unit)
admin.site.register(Etulisateur)
admin.site.register(UserRole)
admin.site.register(NatureAi)
admin.site.register(CustomUser)
admin.site.register(Notification)
