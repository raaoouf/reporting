from rest_framework import serializers
from .models import Brq_model, Etulisateur, NatureAi, Unit, CustomUser, UserRole, Role, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
User = get_user_model()


class BrqSerializer(serializers.ModelSerializer):
    site_ai = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=Unit.objects.all()
    )
    nature_ai = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=NatureAi.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Brq_model
        fields = ('id','ras', 'site_ai', 'date_ai', 
                  'cause_ai', 'lieu_ai', 'temp_ai', 'nature_ai', 
                  'desc_succincte', 'fatal_entre_prise', 'fatal_prestataire', 
                  'fatal_tiers', 'fatal_etrangers',  'nbr_blesse', 
                  'desc_degats_corporels', 'desc_degats_materiels', 
                  'desc_degats_environnementaux', 'dispositons_prise',
                  'desc_dmg_personne', 'desc_dmg_env', 'desc_dmg_biens', 
                  'desc_lieu', 'desc_deroulement', 'clas_ai')
    read_only_fields = ('validated_by', )

    def validate_clas_ai(self, value):
        if value in [None, '']:
            return "0"
        try:
            int(value)
        except ValueError:
            raise serializers.ValidationError("This field must be a number.")
        return value

    def update(self, instance, validated_data):
        exclude_fields = ['ras', 'site_ai', 'date_ai', 'temp_ai']
        for field in exclude_fields:
            if field in validated_data:
                validated_data.pop(field)
        
        return super().update(instance, validated_data)


class EtuSerializer(serializers.ModelSerializer):
    site = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=Unit.objects.all()
    )

    class Meta:
        model = Etulisateur
        fields = ['nom', 'prenom', 'mail', 'site']


class EtuAuthSerializer(serializers.ModelSerializer):
    site = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=Unit.objects.all()
    )

    class Meta:
        model = Etulisateur
        fields = ['nom', 'prenom', 'mail', 'site']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        'no_active_account': _('No active account found with the given credentials')
    }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        role = user.role
        role_name = role.nom if role else None  

        token['username'] = user.username
        token['email'] = user.email
        token['site'] = user.site.nom
        token['role'] = role_name  

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        role = self.user.role
        role_name = role.nom if role else None  

        data['username'] = self.user.username
        data['email'] = self.user.email
        data['site'] = self.user.site.nom
        data['role'] = role_name  

        return data



    
class CustomUserSerializer(serializers.ModelSerializer):
    site = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=Unit.objects.all()
    )
    role = serializers.SlugRelatedField(
        slug_field='nom',
        queryset=Role.objects.all()
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'site', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print("Validated Data:", validated_data)
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            site=validated_data['site'],
            role=validated_data['role']
        )
        return user
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'brq', 'is_read', 'created_at']
        read_only_fields = ['id', 'is_read', 'created_at']