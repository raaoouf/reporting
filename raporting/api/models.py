from django.db import models

# Create your models here.
from django.db import models
from django.forms import ValidationError
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save
from .handlers import send_email_notification
import logging

class Unit(models.Model):
    nom = models.CharField(max_length=10, default='')
    def __str__(self):
             return f"{self.nom}"
    

class NatureAi(models.Model):
    nom = models.CharField(max_length=10, default='')
    def __str__(self):
             return f"{self.nom}"
     
class Role(models.Model):
        nom = models.CharField(max_length=200, default='')
        def __str__(self):
             return f"{self.nom}"
        
class UserRole(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.role.nom}"

class CustomUser(AbstractUser):
    
    site = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return self.username
     
class Brq_model(models.Model):
    ras = models.BooleanField()
    site_ai = models.ForeignKey(Unit, on_delete=models.CASCADE, default='')
    date_ai = models.DateField(null=True, blank=True)
    cause_ai = models.TextField(default='/', blank=True)
    lieu_ai = models.TextField(default='/', blank=True)
    temp_ai = models.TimeField(null=True, blank=True)
    nature_ai = models.ForeignKey(NatureAi, null=True, blank=True, on_delete=models.SET_NULL)
    desc_succincte = models.TextField(blank=True, default='/')
    fatal_entre_prise = models.TextField(blank=True, default='/')
    fatal_prestataire = models.TextField(blank=True, default='/')
    fatal_tiers = models.TextField(blank=True, default='/')
    fatal_etrangers = models.TextField(blank=True, default='/')
    nbr_blesse = models.CharField(max_length=10, blank=True)
    desc_degats_corporels = models.TextField(blank=True, default='/')
    desc_degats_materiels = models.TextField(blank=True, default='/')
    desc_degats_environnementaux = models.TextField(blank=True, default='/')
    dispositons_prise = models.TextField(blank=True, default='/')
    desc_dmg_personne = models.TextField(blank=True, default='/')
    desc_dmg_env = models.TextField(blank=True, default='/')
    desc_dmg_biens = models.TextField(blank=True, default='/')
    desc_lieu = models.TextField(blank=True, default='/')
    desc_deroulement = models.TextField(blank=True, default='/')
    clas_ai = models.CharField(max_length=10, default="0", blank=True)
    validated_by = models.CharField(max_length=255, blank=True)
    ALL_ROLES = ['inj-ui', 'chef-dep-ui', 'directeur-ui', 'inj-rpc', 'chef-rpc', 'directeur-rpc', 'vp']


    def clean(self):
        # Validate nbr_blesse
        if self.nbr_blesse and self.nbr_blesse.strip():
            try:
                int(self.nbr_blesse)
            except ValueError:
                raise ValidationError({'nbr_blesse': 'This field must be a number.'})

        # Validate clas_ai
        if self.clas_ai and self.clas_ai.strip():
            try:
                clas_ai_value = int(self.clas_ai)
                if clas_ai_value >= 5:
                    raise ValidationError({'clas_ai': 'This field must be a number smaller than 4.'})
            except ValueError:
                raise ValidationError({'clas_ai': 'This field must be a number.'})
        else:
            self.clas_ai = "0"
        

    def __str__(self):
        return f"rapport: {self.site_ai}, {self.date_ai}"




    
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    brq = models.ForeignKey(Brq_model, on_delete=models.CASCADE, null=True)  # Autoriser les valeurs NULL
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.message}"

    
