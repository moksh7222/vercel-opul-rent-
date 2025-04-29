from rest_framework import serializers
from .models import User, Property, PropertyImage, RentalAgreement, InvestmentAnalysis

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'wallet_address', 'email', 'full_name', 'kyc_status', 'kyc_submission_date', 'date_joined']
        read_only_fields = ['id', 'wallet_address', 'kyc_status', 'kyc_submission_date', 'date_joined']

class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'wallet_address', 'email', 'full_name', 'kyc_document', 'kyc_status', 'kyc_submission_date']
        read_only_fields = ['id', 'wallet_address', 'kyc_status', 'kyc_submission_date']

    def validate_kyc_document(self, value):
        if value:
            # Check file size
            if value.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Document size should not exceed 5MB")
            
            # Check file extension
            import os
            ext = os.path.splitext(value.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
            if ext not in valid_extensions:
                raise serializers.ValidationError(f"Unsupported file extension. Allowed: {', '.join(valid_extensions)}")
        
        return value

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        
        if 'kyc_document' in validated_data:
            instance.kyc_document = validated_data['kyc_document']
            instance.kyc_status = 'pending'
            instance.kyc_submission_date = serializers.DateTimeField().to_representation(
                serializers.DateTimeField().to_internal_value(serializers.DateTimeField().to_representation(None))
            )
        
        instance.save()
        return instance

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    owner_wallet = serializers.CharField(source='owner.wallet_address', read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'location', 'description', 'price', 'rental_price',
            'bedrooms', 'bathrooms', 'size', 'token_id', 'ipfs_hash',
            'transaction_hash', 'listing_type', 'is_active', 'created_at',
            'updated_at', 'images', 'owner_wallet'
        ]
        read_only_fields = ['id', 'token_id', 'transaction_hash', 'created_at', 'updated_at', 'owner_wallet']

class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'name', 'location', 'description', 'price', 'rental_price',
            'bedrooms', 'bathrooms', 'size', 'ipfs_hash', 'listing_type'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Property.objects.create(owner=user, **validated_data)

class RentalAgreementSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_location = serializers.CharField(source='property.location', read_only=True)
    tenant_wallet = serializers.CharField(source='tenant.wallet_address', read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = RentalAgreement
        fields = [
            'id', 'property', 'property_name', 'property_location', 
            'tenant_wallet', 'tenant_name', 'start_date', 'end_date',
            'monthly_rent', 'security_deposit', 'transaction_hash',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_hash', 'created_at', 'updated_at']

class InvestmentAnalysisRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentAnalysis
        fields = [
            'location', 'size', 'price', 'bedrooms', 'bathrooms',
            'property_type', 'year_built'
        ]

class InvestmentAnalysisResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentAnalysis
        fields = [
            'id', 'location', 'size', 'price', 'bedrooms', 'bathrooms',
            'property_type', 'year_built', 'monthly_rent', 'annual_roi',
            'area_growth_score', 'predicted_value_growth', 'comparable_properties',
            'created_at'
        ]
        read_only_fields = [
            'id', 'monthly_rent', 'annual_roi', 'area_growth_score',
            'predicted_value_growth', 'comparable_properties', 'created_at'
        ]

class DashboardSerializer(serializers.Serializer):
    kyc_status = serializers.CharField()
    properties = PropertySerializer(many=True)
    rental_agreements = RentalAgreementSerializer(many=True)
    rental_income = serializers.DecimalField(max_digits=10, decimal_places=2)
