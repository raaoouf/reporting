from django.urls import path
from .views import AccidentsByTimeInterval, BrqView, CauseOccurrenceCount, ClassOccurrenceCount, CompteRenduView, DeleteBrq, GeneratePDF, GeneratePDFByDate, GetBrqForToday, MarkNotificationAsReadView, MarkNotificationsRead, RegisterUserView, RemplissageBrq, GetBrq, GetBrqByDate, ReportProblem, UpdateBrq,CustomTokenObtainPairView, GetBrqForSelectedSite, GetBrqForUserSite, GetBrqByDateOwnSite, UserNotificationsView, ValidateBrq, GetAccidentCountView, AccidentCountBySite, AccidentNatureCount 

urlpatterns = [
    path('home', BrqView.as_view()),
    path('create-data', RemplissageBrq.as_view()),
    # path('create-etu', RemplissageEtu.as_view()),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('sitej/', GetBrqForUserSite.as_view(), name='brqloko'),
    path('notifications', UserNotificationsView.as_view(), name='user-notifications'),
    path('update-brq/<str:site>/<str:date>/<str:time>/', UpdateBrq.as_view(), name='update_brq'),

    path('get-brq-ui/',GetBrqForSelectedSite.as_view(),name='brqUil'),
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('get-brq', GetBrq.as_view(), name='home-api'),
    path('gethis/',GetBrqByDateOwnSite.as_view(), name='Brqhis'),
    path('get-brq-con/',GetBrqByDate.as_view(), name='brq_cons'),
    path('get-brq-consolide/',GetBrqForToday.as_view(), name='brq_consa'),
    path('nombre-acc-year-site',GetAccidentCountView.as_view(), name='nombre'),
    path('nombre-acc-year/',AccidentCountBySite.as_view(), name='nomby'),
    path('Nature', AccidentNatureCount.as_view(), name='nature'),
    path('delete-brq/<int:brq_id>/', DeleteBrq.as_view(), name='delete_brq'),
    path('delete-brq/<str:site_name>/<str:date_str>/<str:time_str>', DeleteBrq.as_view(), name='delete_brq'),
    path('token1/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register1/', RegisterUserView.as_view(), name='register_user'),
    path('get-brq-uiok', RegisterUserView.as_view(), name='brqUi'),
    # path('login1/', LoginView.as_view(), name='login'),
    path('valider-brq/', ValidateBrq.as_view(), name='validate_brq'),
    path('report-problem', ReportProblem.as_view(), name='report_problem'),
    path('TIMING', AccidentsByTimeInterval.as_view(), name='DASHTIMING'),
    path('CLASS', ClassOccurrenceCount.as_view(), name='DASHCLASS'),
    path('cause', CauseOccurrenceCount.as_view(), name='DASHCause'),
    path('PDF', GeneratePDF.as_view(), name='Pdf'),
    path('PDFBYDATE', GeneratePDFByDate.as_view(), name='Pdfbydate'),
    path('compte_rendu/<str:date>/<str:site_name>/<str:time>/', CompteRenduView.as_view(), name='compte_rendu'),
    
    path('Read',MarkNotificationsRead.as_view(), name='Read'),
    ]
