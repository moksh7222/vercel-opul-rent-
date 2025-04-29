from django.utils import timezone
from django.db.models import Sum
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Property, PropertyImage, RentalAgreement, InvestmentAnalysis
from .serializers import (
    UserSerializer, KYCSerializer, PropertySerializer, PropertyCreateSerializer,
    PropertyImageSerializer, RentalAgreementSerializer, InvestmentAnalysisRequestSerializer,
    InvestmentAnalysisResponseSerializer, DashboardSerializer
)
from .permissions import IsOwnerOrReadOnly
from .blockchain import verify_signature, mint_property_nft
from .ml_model import analyze_investment

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')
        
        if not wallet_address or not signature or not message:
            return Response(
                {'error': 'Wallet address, signature, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the signature
        if not verify_signature(wallet_address, signature, message):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get or create user
        user, created = User.objects.get_or_create(wallet_address=wallet_address.lower())
        
        # Generate JWT token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'is_new_user': created
        })

class KYCView(APIView):
    def get(self, request):
        user = request.user
        serializer = KYCSerializer(user)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        serializer = KYCSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Set KYC submission date
            user.kyc_submission_date = timezone.now()
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['listing_type', 'bedrooms', 'bathrooms']
    search_fields = ['name', 'location', 'description']
    ordering_fields = ['price', 'rental_price', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PropertyCreateSerializer
        return PropertySerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def my_properties(self, request):
        properties = Property.objects.filter(owner=request.user)
        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mint(self, request, pk=None):
        property_obj = self.get_object()
        
        # Check if property already has a token_id
        if property_obj.token_id:
            return Response(
                {'error': 'Property is already minted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is the owner
        if property_obj.owner != request.user:
            return Response(
                {'error': 'Only the owner can mint this property'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Call blockchain service to mint NFT
            token_id, tx_hash = mint_property_nft(
                property_obj.id,
                property_obj.ipfs_hash,
                property_obj.price,
                request.user.wallet_address
            )
            
            # Update property with token_id and transaction_hash
            property_obj.token_id = token_id
            property_obj.transaction_hash = tx_hash
            property_obj.save()
            
            return Response({
                'message': 'Property minted successfully',
                'token_id': token_id,
                'transaction_hash': tx_hash
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_ 
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PropertyImageViewSet(viewsets.ModelViewSet):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        property_id = self.kwargs.get('property_pk')
        if property_id:
            return PropertyImage.objects.filter(property_id=property_id)
        return PropertyImage.objects.none()
    
    def perform_create(self, serializer):
        property_id = self.kwargs.get('property_pk')
        property_obj = Property.objects.get(id=property_id)
        
        # Check if user is the owner of the property
        if property_obj.owner != self.request.user:
            raise permissions.PermissionDenied("You don't have permission to add images to this property")
        
        serializer.save(property=property_obj)

class RentalAgreementViewSet(viewsets.ModelViewSet):
    queryset = RentalAgreement.objects.all()
    serializer_class = RentalAgreementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        user = self.request.user
        # Get agreements where user is either the tenant or the property owner
        return RentalAgreement.objects.filter(
            models.Q(tenant=user) | models.Q(property__owner=user)
        )
    
    def perform_create(self, serializer):
        property_id = serializer.validated_data.get('property').id
        property_obj = Property.objects.get(id=property_id)
        
        # Check if property is available for rent
        if property_obj.listing_type != 'rent' or not property_obj.is_active:
            raise serializers.ValidationError("This property is not available for rent")
        
        # Set the tenant to the current user
        serializer.save(tenant=self.request.user)

class InvestmentAnalysisView(APIView):
    def post(self, request):
        serializer = InvestmentAnalysisRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Run the analysis using ML model
            analysis_results = analyze_investment(serializer.validated_data)
            
            # Create and save the analysis
            analysis = InvestmentAnalysis.objects.create(
                user=request.user,
                **serializer.validated_data,
                **analysis_results
            )
            
            response_serializer = InvestmentAnalysisResponseSerializer(analysis)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    def get(self, request):
        user = request.user
        
        # Get user's properties
        properties = Property.objects.filter(owner=user)
        
        # Get user's rental agreements
        rental_agreements = RentalAgreement.objects.filter(
            models.Q(tenant=user) | models.Q(property__owner=user)
        ).filter(status='active')
        
        # Calculate rental income (for property owners)
        rental_income = rental_agreements.filter(
            property__owner=user
        ).aggregate(total=Sum('monthly_rent'))['total'] or 0
        
        # Prepare dashboard data
        dashboard_data = {
            'kyc_status': user.kyc_status,
            'properties': properties,
            'rental_agreements': rental_agreements,
            'rental_income': rental_income
        }
        
        serializer = DashboardSerializer(dashboard_data)
        return Response(serializer.data)
