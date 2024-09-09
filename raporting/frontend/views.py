import json
from django.http import JsonResponse
from django.shortcuts import render

from .models import Brq_model

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

