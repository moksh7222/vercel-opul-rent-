from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, KYCView, PropertyViewSet, PropertyImageViewSet,
    RentalAgreementViewSet, InvestmentAnalysisView, DashboardView
)

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'properties/(?P<property_pk>[^/.]+)/images', PropertyImageViewSet, basename='property-images')
router.register(r'rental-agreements', RentalAgreementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('kyc/', KYCView.as_view(), name='kyc'),
    path('investment-analysis/', InvestmentAnalysisView.as_view(), name='investment-analysis'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
