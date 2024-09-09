from django.urls import path


from .views import  index

urlpatterns = [

    path('', index),
    path('remplissageBrq', index),
    path('auth',index),
    
    

]
