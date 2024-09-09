from django.db import models

# Create your models here.
class Brq_model(models.Model):
    ras = models.BooleanField()
    site_ai = models.CharField(max_length=200)
    date_ai = models.DateField(null=True)
    cause_ai = models.TextField(default='/')
    lieu_ai = models.TextField(default='/')
    temp_ai = models.TimeField(null=True)
    nature = models.TextField(blank=True)
    desc_succincte = models.TextField(blank=True)
    fatal_entre_prise = models.TextField(blank=True)
    fatal_prestataire = models.TextField(blank=True)
    fatal_tiers = models.TextField(blank=True)
    fatal_etrangers = models.TextField(blank=True)
    nbr_blesse_choices = [
        (0, '0'),
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
    ]
    nbr_blesse = models.IntegerField(choices=nbr_blesse_choices, default=0)
    desc_degats_corporels = models.TextField(blank=True)
    desc_degats_materiels = models.TextField(blank=True)
    desc_degats_environnementaux = models.TextField(blank=True)
    dispositons_prise = models.TextField(blank=True)

    def __str__(self):
        return f"rapport: {self.site_ai}, {self.date_ai}"