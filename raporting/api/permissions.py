from datetime import date
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

from .models import Brq_model


class CanCreateBrqPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canRemplissageBrq')

class CanGetBrqPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrq')

class CanGetBrqByDatePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrqByDate')

class CanGetBrqForUserSitePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrqForUserSite')

class CanGetBrqForSelectedSitePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrqForSelectedSite')

class CanGetBrqForSelectedDateOwnSitePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrqByDateOwnSite')
class CanUpdateBrqPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canUpdateBrq')

class CanGetBrqConsTodayPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canGetBrqConsToday')

class CanValidateBrqPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canValidateBrq')
    
class CanDeleteBrqPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('api.canDeleteBrq')