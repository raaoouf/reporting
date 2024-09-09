from collections import defaultdict
import json
import os
from django.conf import settings
from django.forms import model_to_dict
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_list_or_404, get_object_or_404, redirect, render
from rest_framework import generics, status
from django.core.exceptions import ValidationError
from .models import Brq_model, Etulisateur, Notification, Unit
from .serializers import BrqSerializer, CustomTokenObtainPairSerializer, CustomUserSerializer, EtuAuthSerializer, LoginSerializer, NotificationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import BrqSerializer, EtuSerializer
from datetime import date, datetime, timedelta
from calendar import monthrange
from django.db.models import Q, CharField, Count
from django.db.models.functions import Cast
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from .permissions import CanCreateBrqPermission, CanGetBrqByDatePermission, CanGetBrqForSelectedSitePermission, CanGetBrqForUserSitePermission, CanGetBrqPermission, CanGetBrqForSelectedDateOwnSitePermission, CanUpdateBrqPermission, CanGetBrqConsTodayPermission, CanValidateBrqPermission, CanDeleteBrqPermission
from django.http import JsonResponse
from django.views import View
from .models import Brq_model, Unit
from django.db.models import Count

from django.template.loader import get_template

from weasyprint import HTML
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.dateformat import DateFormat
from rest_framework.exceptions import NotFound
from rest_framework.generics import UpdateAPIView
#permissions
if not Permission.objects.filter(codename='canRemplissageBrq').exists():
    canRemplissageBrq = Permission.objects.create(
        codename='canRemplissageBrq',
        name='Can create brq',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )

if not Permission.objects.filter(codename='canGetBrq').exists():
    canGetBrq = Permission.objects.create(
        codename='canGetBrq',
        name='Can voir brq tel jour tel unit',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canGetBrqByDate').exists():
    canGetBrqByDate = Permission.objects.create(
        codename='canGetBrqByDate',
        name='Can voir brq consolidee tel date',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canGetBrqForUserSite').exists():
    canGetBrqForUserSite = Permission.objects.create(
        codename='canGetBrqForUserSite',
        name='Can voir brq de jour meme juste son site',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canGetBrqForSelectedSite').exists():
    canGetBrqForSelectedSite = Permission.objects.create(
        codename='canGetBrqForSelectedSite',
        name='Can voir brq de jour meme de tel site',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canGetBrqByDateOwnSite').exists():
    canGetBrqByDateOwnSite = Permission.objects.create(
        codename='canGetBrqByDateOwnSite',
        name='Can voir brq de tel jour de own site',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canUpdateBrq').exists():
    canUpdateBrq = Permission.objects.create(
        codename='canUpdateBrq',
        name='Can update brq ui',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
if not Permission.objects.filter(codename='canGetBrqConsToday').exists():
    canGetBrqConsToday = Permission.objects.create(
        codename='canGetBrqConsToday',
        name='Can voir brq de jout de tous les site',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )
    
if not Permission.objects.filter(codename='canValidateBrq').exists():
    canValidateBrq = Permission.objects.create(
        codename='canValidateBrq',
        name='Can valider brq',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )

if not Permission.objects.filter(codename='canDeleteBrq').exists():
    canDeleteBrq = Permission.objects.create(
        codename='canDeleteBrq',
        name='Can supprimer brq',
        content_type=ContentType.objects.get_for_model(Brq_model),
    )




class BrqView(generics.CreateAPIView):
    queryset = Brq_model.objects.all()
    serializer_class = BrqSerializer




class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.user
            tokens = serializer.validated_data
            response_data = {
                'username': user.username,
                'token': tokens['access'],
                'refresh_token': tokens['refresh'],
                'site': user.site.nom,
                'role': user.role.nom,
            }
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterUserView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = CustomUserSerializer

class RemplissageBrq(APIView):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanCreateBrqPermission]

    def post(self, request, format=None):
        print("hello", request.data)
        user_site = request.user.site
        request.data['site_ai'] = user_site
        serializer = self.serializer_class(data=request.data)
        print("helloo", serializer.initial_data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            ras = validated_data.get('ras')
            date_ai = validated_data.get('date_ai')
            cause_ai = validated_data.get('cause_ai', '/')
            lieu_ai = validated_data.get('lieu_ai', '/')
            temp_ai = validated_data.get('temp_ai')
            nature_ai_instance = validated_data.get('nature_ai', None)
            desc_succincte = validated_data.get('desc_succincte', '/')
            fatal_entre_prise = validated_data.get('fatal_entre_prise', '/')
            fatal_prestataire = validated_data.get('fatal_prestataire', '/')
            fatal_tiers = validated_data.get('fatal_tiers', '/')
            fatal_etrangers = validated_data.get('fatal_etrangers', '/')
            nbr_blesse = validated_data.get('nbr_blesse', '')
            desc_degats_corporels = validated_data.get('desc_degats_corporels', '/')
            desc_degats_materiels = validated_data.get('desc_degats_materiels', '/')
            desc_degats_environnementaux = validated_data.get('desc_degats_environnementaux', '/')
            dispositons_prise = validated_data.get('dispositons_prise', '/')
            desc_dmg_personne = validated_data.get('desc_dmg_personne', '/')
            desc_dmg_env = validated_data.get('desc_dmg_env', '/')
            desc_dmg_biens = validated_data.get('desc_dmg_biens', '/')
            desc_lieu = validated_data.get('desc_lieu', '/')
            desc_deroulement = validated_data.get('desc_deroulement', '/')
            clas_ai = validated_data.get('clas_ai', '0')

            queryset = Brq_model.objects.filter(site_ai=user_site, date_ai=date_ai, temp_ai=temp_ai)
            if not queryset.exists():
                brq = Brq_model(
                    ras=ras, site_ai=user_site, date_ai=date_ai,
                    cause_ai=cause_ai, lieu_ai=lieu_ai, temp_ai=temp_ai,
                    nature_ai=nature_ai_instance, desc_succincte=desc_succincte,
                    fatal_entre_prise=fatal_entre_prise, fatal_prestataire=fatal_prestataire,
                    fatal_tiers=fatal_tiers, fatal_etrangers=fatal_etrangers,
                    nbr_blesse=nbr_blesse, desc_degats_corporels=desc_degats_corporels,
                    desc_degats_materiels=desc_degats_materiels, desc_degats_environnementaux=desc_degats_environnementaux,
                    dispositons_prise=dispositons_prise, desc_dmg_personne=desc_dmg_personne,
                    desc_dmg_env=desc_dmg_env, desc_dmg_biens=desc_dmg_biens, desc_lieu=desc_lieu,
                    desc_deroulement=desc_deroulement, clas_ai=clas_ai
                )
                brq.save()
                return Response(BrqSerializer(brq).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class BrqValidationMixin:
    # Define roles dictionary outside the function
    
    roles = {
        "inj-ui": [],
        "chef-dep-ui": ["inj-ui"],
        "directeur-ui": ["chef-dep-ui"],
        "inj-rpc": ["directeur-ui"],
        "chef-dep-rpc": ["directeur-ui"],
        "directeur-rpc": ["inj-rpc"],
        "vp": ["directeur-ui"],
        "brq_urgent":["directeur-ui"]
    }
    
    def validate_brq(self, brq, user):
        user_role = user.role.nom.strip()
        print(f"user.role: {user.role}")
        print(f"self.roles.keys(): {self.roles.keys()}")

        if not brq.validated_by:
            brq.validated_by = ""

        if user_role not in self.roles.keys():
            raise ValidationError(f'Invalid role "{user_role}" for validation. Allowed roles: {", ".join(self.roles.keys())}')

        allowed_roles = self.roles[user_role]

        if not set(allowed_roles).issubset(set(brq.validated_by.split(","))):
            raise ValidationError(f'This BRQ needs to be validated by {", ".join(allowed_roles)} first.')
        

class GetBrqForToday(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqConsTodayPermission]

    def get(self, request, format=None):
        today = date.today()
        try:
            brqs = Brq_model.objects.filter(date_ai=today)
            serializer = BrqSerializer(brqs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Brq_model.DoesNotExist:
            return Response({'error': 'BRQs not found for today'}, status=status.HTTP_404_NOT_FOUND)
#get brq ta3 kach site f kach date

class GetBrq(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqPermission]

    def get(self, request, format=None):
        user = request.user
        selected_site_name = request.GET.get('selected_site')
        selected_date_str = request.GET.get('selected_date')

        if selected_site_name is not None and selected_date_str is not None:
            try:
                selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
                
                unit = get_object_or_404(Unit, nom=selected_site_name)
                
                brqs = get_list_or_404(Brq_model, site_ai=unit, date_ai=selected_date)
                
                for brq in brqs:
                    self.validate_brq(brq, user)
                
                serializer = BrqSerializer(brqs, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Unit.DoesNotExist:
                return Response({'error': 'Unit not found'}, status=status.HTTP_404_NOT_FOUND)
            except Brq_model.DoesNotExist:
                return Response({'error': 'BRQs not found'}, status=status.HTTP_404_NOT_FOUND)
            except ValueError:
                return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Both selected_site and selected_date are required'}, status=status.HTTP_400_BAD_REQUEST)
        
#get brq ta3hom ga3 f selected nhar         
class GetBrqByDate(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqByDatePermission]

    def validate_date(self, date_str):
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return None

    def get(self, request, format=None):
        user = request.user
        selected_date_str = request.GET.get('selected_date')

        if not selected_date_str:
            return Response({'error': 'Selected date is required'}, status=status.HTTP_400_BAD_REQUEST)

        selected_date = self.validate_date(selected_date_str)
        if not selected_date:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        brqs = Brq_model.objects.filter(Q(date_ai=selected_date))
        for brq in brqs:
            self.validate_brq(brq, user)

        if brqs.exists():
            serializer = BrqSerializer(brqs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'BRQs not found for the selected date'}, status=status.HTTP_404_NOT_FOUND)
    

CustomUser = get_user_model()
## get the brq ta3 hadhak nhar f ui


class GetBrqForUserSite(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqForUserSitePermission]

    def get(self, request, format=None):
        user = request.user
        user_site = user.site
        print(f"...Current user's role: {user.role.nom}")
        if not user_site:
            return Response({'error': 'User does not have a site associated'}, status=status.HTTP_400_BAD_REQUEST)

        selected_date = date.today()
        brqs = Brq_model.objects.filter(site_ai=user_site, date_ai=selected_date)
        for brq in brqs:
            self.validate_brq(brq, user)
        
        if brqs.exists():
            serializer = BrqSerializer(brqs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'BRQs for the user\'s site not found for today'}, status=status.HTTP_404_NOT_FOUND)
        
    


#get brq ta3 hadhak nhar ta3 wahed men les ui

class GetBrqForSelectedSite(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqForSelectedSitePermission]

    def get(self, request, format=None):
        selected_site_name = request.GET.get('selected_site')
        
        if not selected_site_name:
            return Response({'error': 'Selected site name is required'}, status=status.HTTP_400_BAD_REQUEST)

        selected_date = date.today()
        try:
            selected_site = Unit.objects.get(nom=selected_site_name)
        except Unit.DoesNotExist:
            return Response({'error': 'Selected site not found'}, status=status.HTTP_404_NOT_FOUND)

        brqs = Brq_model.objects.filter(site_ai=selected_site, date_ai=selected_date)
        for brq in brqs:
            self.validate_brq(brq, request.user)
        
        if brqs.exists():
            serializer = BrqSerializer(brqs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'BRQs for the selected site not found for today'}, status=status.HTTP_404_NOT_FOUND)

        


#get brq tel date of site of user lui meme

class GetBrqByDateOwnSite(APIView, BrqValidationMixin):
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanGetBrqForSelectedDateOwnSitePermission]

    def validate_date(self, date_str):
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return None

    def get(self, request, format=None):
        selected_date_str = request.GET.get('selected_date')
        user_site = request.user.site

        if not all([selected_date_str, user_site]):
            return Response({'error': 'authenticated users site are required'}, status=status.HTTP_400_BAD_REQUEST)

        selected_date = self.validate_date(selected_date_str)
        if not selected_date:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        brqs = Brq_model.objects.filter(Q(date_ai=selected_date) & Q(site_ai=user_site))
        for brq in brqs:
            self.validate_brq(brq, request.user)

        if brqs.exists():
            serializer = BrqSerializer(brqs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'BRQs not found for the selected site and date'}, status=status.HTTP_404_NOT_FOUND)



class UpdateBrq(UpdateAPIView):
    queryset = Brq_model.objects.all()
    serializer_class = BrqSerializer
    permission_classes = [IsAuthenticated, CanUpdateBrqPermission]
    lookup_url_kwarg = None  # Disable lookup by primary key

    def get_object(self):
        site_name = self.kwargs.get('site')
        date_str = self.kwargs.get('date')
        time_str = self.kwargs.get('time')

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            time = datetime.strptime(time_str, '%H:%M:%S').time()  # Updated format to include seconds
        except ValueError:
            raise NotFound("Invalid date or time format") # type: ignore

        unit = get_object_or_404(Unit, nom=site_name)

        obj = get_object_or_404(Brq_model, site_ai=unit, date_ai=date, temp_ai=time)

        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        serializer.save()



class MarkNotificationAsReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_read = True
        instance.save()
        return Response({'detail': 'Notification marked as read.'}, status=status.HTTP_200_OK)


class ValidateBrq(APIView):
    permission_classes = [IsAuthenticated, CanValidateBrqPermission]

    def patch(self, request, format=None):
        user_role = request.user.role.nom  
        current_date = timezone.now().date()
        user_site = request.user.site

        if not user_site:
            return Response({'error': 'User does not belong to any site'}, status=status.HTTP_400_BAD_REQUEST)

        brqs = Brq_model.objects.filter(date_ai=current_date, site_ai=user_site)

        validation_chain = [
            'inj-ui', 'chef-dep-ui', 'directeur-ui', 'inj-rpc', 
            'chef-dep-rpc', 'directeur-rpc', 
        ]

        if user_role not in validation_chain:
            return Response({'error': 'Invalid user role for validation'}, status=status.HTTP_400_BAD_REQUEST)

        for brq in brqs:
            if not brq.validated_by:
                brq.validated_by = user_role
            else:
                validated_roles = brq.validated_by.split(',')
                if user_role not in validated_roles:
                    brq.validated_by += f',{user_role}'
            brq.save()

        if user_site.nom == "DCRPC" and user_role in ['inj-rpc', 'chef-dep-rpc', 'directeur-rpc']:
            all_brqs_of_day = Brq_model.objects.filter(date_ai=current_date)
            for brq in all_brqs_of_day:
                if not brq.validated_by:
                    brq.validated_by = user_role
                else:
                    validated_roles = brq.validated_by.split(',')
                    if user_role not in validated_roles:
                        brq.validated_by += f',{user_role}'
                brq.save()

        return Response({'message': 'BRQs validated successfully'}, status=status.HTTP_200_OK)
    


    
class GetAccidentCountView(View):

    def get(self, request):
        selected_year = request.GET.get('year')
        selected_site_name = request.GET.get('site')

        if not all([selected_year, selected_site_name]):
            return JsonResponse({'error': 'Both year and site are required'}, status=400)

        try:
            selected_year = int(selected_year)
        except ValueError:
            return JsonResponse({'error': 'Invalid year format'}, status=400)

        try:
            selected_site = Unit.objects.get(nom=selected_site_name)
        except Unit.DoesNotExist:
            return JsonResponse({'error': 'Selected site not found'}, status=404)

        start_date = date(selected_year, 1, 1)
        end_date = date(selected_year, 12, 31)

        accidents_count = Brq_model.objects.filter(
            ras=False,
            site_ai=selected_site,
            date_ai__range=(start_date, end_date)
        ).count()

        return JsonResponse({'accidents_count': accidents_count}, status=200)
    

class AccidentCountBySite(APIView):
    
    def get(self, request):
        year = request.query_params.get('year', None)
        
        if year is None:
            return Response({"error": "Year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        year_str = str(year)

        accident_counts = (
            Brq_model.objects.filter(date_ai__year=year_str, ras=False)
            .values('site_ai__nom')  
            .annotate(accident_count=Count('id'))  
            .order_by('site_ai__nom')  
        )

        result = {item['site_ai__nom']: item['accident_count'] for item in accident_counts}

        return Response(result
                        )
class CauseOccurrenceCount(APIView):

    def get(self, request):
        try:
            year = request.query_params.get('year', None)
            if year is None:
                return Response({"error": "Year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            year_str = str(year)
            cause_counts = (
                Brq_model.objects.filter(date_ai__year=year_str, ras=False)
                .annotate(cause_str=Cast('cause_ai', CharField()))  # Convert NCLOB to CharField
                .values('cause_str')
                .annotate(cause_count=Count('id'))
                .order_by('cause_str')
            )

            result = {item['cause_str']: item['cause_count'] for item in cause_counts}

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ClassOccurrenceCount(APIView):

    def get(self, request):
        try:
            year = request.query_params.get('year', None)
            if year is None:
                return Response({"error": "Year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            year_str = str(year)
            class_counts = (
                Brq_model.objects.filter(date_ai__year=year_str, ras=False)
                .values('clas_ai')
                .annotate(class_count=Count('id'))
                .order_by('clas_ai')
            )

            result = {item['clas_ai']: item['class_count'] for item in class_counts}

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)     
class AccidentsByTimeInterval(APIView):

    def get(self, request):
        try:
            year = request.query_params.get('year', None)
            if year is None:
                return Response({"error": "Year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            year_str = str(year)
            accidents = Brq_model.objects.filter(date_ai__year=year_str, ras=False)

            result = {}

            for month in range(1, 13):  
                month_str = str(month).zfill(2)  

                work_time_count = 0
                after_work_count = 0
                midnight_count = 0

                _, num_days = monthrange(int(year_str), month)

                for day in range(1, num_days + 1):
                    accidents_day = accidents.filter(date_ai__month=month, date_ai__day=day)

                    for accident in accidents_day:
                        if accident.temp_ai:
                            accident_time = accident.temp_ai.strftime('%H:%M:%S')

                            if '08:00:00' <= accident_time < '16:00:00':
                                work_time_count += 1
                            elif '16:00:00' <= accident_time < '00:00:00':
                                after_work_count += 1
                            else:
                                midnight_count += 1

                result[f"{month_str}"] = {
                    "workTime": work_time_count,
                    "afterWork": after_work_count,
                    "midnight": midnight_count
                }

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AccidentNatureCount(APIView):

    def get(self, request):
        try:
            year = request.query_params.get('year', None)
            
            if year is None:
                return Response({"error": "Year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            year_str = str(year)

            nature_counts = (
                Brq_model.objects.filter(date_ai__year=year_str, ras=False)
                .values('nature_ai__nom')  # Group by nature name
                .annotate(accident_count=Count('id'))  # Count number of accidents for each nature
                .order_by('nature_ai__nom')  # Optionally, order by nature name
            )

            result = {item['nature_ai__nom']: item['accident_count'] for item in nature_counts}

            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Log the exception
            print(f"An error occurred: {str(e)}")
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteBrq(APIView):
    permission_classes = [IsAuthenticated, CanDeleteBrqPermission]

    def delete(self, request, site_name, date_str, time_str):
        try:

            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                time = datetime.strptime(time_str, '%H:%M:%S').time()
            except ValueError:
                return Response({"error": "Invalid date or time format"}, status=status.HTTP_400_BAD_REQUEST)


            unit = get_object_or_404(Unit, nom=site_name)


            brq = get_object_or_404(Brq_model, site_ai=unit, date_ai=date, temp_ai=time)


            two_days_ago = date.today() - timedelta(days=2)


            if brq.date_ai >= two_days_ago:

                brq.delete()
                return Response({"message": "BRQ deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Cannot delete BRQ more than 2 days old"}, status=status.HTTP_400_BAD_REQUEST)

        except Brq_model.DoesNotExist:
            return Response({"error": "BRQ not found"}, status=status.HTTP_404_NOT_FOUND)
class GeneratePDF(View):
    def get(self, request):
        current_date = date.today()
        
        site_names_top = ('RA1G', 'RA1K', 'RA1D', 'RA2K', 'RA1Z')
        site_names_bottom = ('CP1Z', 'CP2K')

        brq_data_top = Brq_model.objects.filter(date_ai=current_date, ras=False, site_ai__nom__in=site_names_top).order_by('site_ai')
        brq_data_bottom = Brq_model.objects.filter(date_ai=current_date, ras=False, site_ai__nom__in=site_names_bottom).order_by('site_ai')
        
        has_top_brqs = brq_data_top.exists()
        has_bottom_brqs = brq_data_bottom.exists()

        row_span_top = brq_data_top.count() if has_top_brqs else 1
        row_span_bottom = brq_data_bottom.count() if has_bottom_brqs else 1
        
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'logosonatrach.png')  # Absolute URL of the image
        context = {
            'logo_url': logo_url,
            'date': DateFormat(current_date).format('F d, Y'),
            'brq_data_top': brq_data_top if has_top_brqs else [],
            'brq_data_bottom': brq_data_bottom if has_bottom_brqs else [],
            'has_top_brqs': has_top_brqs,
            'has_bottom_brqs': has_bottom_brqs,
            'row_span_top': row_span_top,
            'row_span_bottom': row_span_bottom,
        }

        html_string = render_to_string('pdf_template.html', context)
        
        pdf = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="brq_report.pdf"'
        return response
    
class GeneratePDFByDate(View):
    def get(self, request):
        selected_date_str = request.GET.get('selected_date')
        
        if not selected_date_str:
            return HttpResponse('Selected date is required', status=400)
        
        try:
            selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
        except ValueError:
            return HttpResponse('Invalid date format', status=400)

        site_names_top = ('RA1G', 'RA1K', 'RA1D', 'RA2K', 'RA1Z')
        site_names_bottom = ('CP1Z', 'CP2K')

        brq_data_top = Brq_model.objects.filter(date_ai=selected_date, ras=False, site_ai__nom__in=site_names_top).order_by('site_ai')
        brq_data_bottom = Brq_model.objects.filter(date_ai=selected_date, ras=False, site_ai__nom__in=site_names_bottom).order_by('site_ai')
        
        has_top_brqs = brq_data_top.exists()
        has_bottom_brqs = brq_data_bottom.exists()

        row_span_top = brq_data_top.count() if has_top_brqs else 1
        row_span_bottom = brq_data_bottom.count() if has_bottom_brqs else 1
        
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'logosonatrach.png')  # Absolute URL of the image
        context = {
            'logo_url': logo_url,
            'date': DateFormat(selected_date).format('F d, Y'),
            'brq_data_top': brq_data_top if has_top_brqs else [],
            'brq_data_bottom': brq_data_bottom if has_bottom_brqs else [],
            'has_top_brqs': has_top_brqs,
            'has_bottom_brqs': has_bottom_brqs,
            'row_span_top': row_span_top,
            'row_span_bottom': row_span_bottom,
        }

        html_string = render_to_string('pdf_template.html', context)
        
        pdf = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="brq_report_{selected_date_str}.pdf"'
        return response

class CompteRenduView(View):
    def get(self, request, *args, **kwargs):
        date = kwargs.get('date')
        site_name = kwargs.get('site_name')
        time = kwargs.get('time')

        brq_instance = self.get_brq_instance(date, site_name, time)

        if brq_instance:
            image_url = request.build_absolute_uri(settings.STATIC_URL + 'logosonatrach.png')
            
            template = get_template('compte_rendu_template.html')
            context = {'brq_instance': brq_instance, 'image_url': image_url}
            rendered_template = template.render(context)

            pdf = HTML(string=rendered_template, base_url=request.build_absolute_uri()).write_pdf()

            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = 'inline; filename="compte_rendu.pdf"'
            return response
        else:
            return HttpResponse("BRQ instance not found", status=404)

    def get_brq_instance(self, date, site_name, time):
        try:
            brq_instance = Brq_model.objects.get(date_ai=date, site_ai__nom=site_name, temp_ai=time)
            return brq_instance
        except Brq_model.DoesNotExist:
            return None

class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user).order_by('-created_at')



class MarkNotificationsRead(APIView):
    def post(self, request):
        user = request.user
        try:
            notifications = Notification.objects.filter(user=user, is_read=False)  # Corrected field name
            notifications.update(is_read=True)
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportProblem(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        brq_text = request.data.get('brq_text')  # Text of the BRQ problem

        reporting_role = user.role.nom

        role_notification_mapping = {
            'directeur-rpc': 'chef-dep-rpc',
            'chef-dep-rpc': 'inj-rpc',
            'inj-rpc': 'directeur-ui',
            'directeur-ui': 'chef-dep-ui',
            'chef-dep-ui': 'inj-ui'
        }

        target_role = role_notification_mapping.get(reporting_role)

        target_users = CustomUser.objects.filter(role__nom=target_role, site=user.site)

        for target_user in target_users:
            Notification.objects.create(
                user=target_user,
                message=brq_text,
                brq=None  
            )

        return Response({"message": "Problem reported successfully"}, status=status.HTTP_200_OK)
    