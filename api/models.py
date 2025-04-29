import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

def kyc_document_path(instance, filename):
    """Generate a unique path for KYC documents"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('kyc_documents', filename)

def property_image_path(instance, filename):
    """Generate a unique path for property images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('property_images', filename)

class UserManager(BaseUserManager):
    def create_user(self, wallet_address, email=None, password=None, **extra_fields):
        if not wallet_address:
            raise ValueError('Users must have a wallet address')
        
        email = self.normalize_email(email) if email else None
        user = self.model(wallet_address=wallet_address.lower(), email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user

    def create_superuser(self, wallet_address, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(wallet_address, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet_address = models.CharField(max_length=42, unique=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True)
    
    # KYC fields
    kyc_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    kyc_document = models.FileField(upload_to=kyc_document_path, blank=True, null=True)
    kyc_submission_date = models.DateTimeField(blank=True, null=True)
    kyc_notes = models.TextField(blank=True)
    
    # Standard user fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'wallet_address'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.wallet_address
    
    def save(self, *args, **kwargs):
        if self.wallet_address:
            self.wallet_address = self.wallet_address.lower()
        super().save(*args, **kwargs)

class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=18, decimal_places=8)  # In ETH
    rental_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # In USD
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    size = models.PositiveIntegerField(null=True, blank=True)  # In square feet
    
    # Blockchain related fields
    token_id = models.CharField(max_length=255, blank=True, null=True)
    ipfs_hash = models.CharField(max_length=255)
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    
    # Listing details
    listing_type = models.CharField(
        max_length=10,
        choices=[
            ('buy', 'For Sale'),
            ('rent', 'For Rent'),
        ],
        default='buy'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class PropertyImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=property_image_path)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.property.name}"

class RentalAgreement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rental_agreements')
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rental_agreements')
    start_date = models.DateField()
    end_date = models.DateField()
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)  # In USD
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)  # In USD
    
    # Blockchain related fields
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('expired', 'Expired'),
            ('terminated', 'Terminated'),
        ],
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Rental agreement for {self.property.name}"

class InvestmentAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investment_analyses')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='analyses')
    
    # Property details for analysis
    location = models.CharField(max_length=255)
    size = models.PositiveIntegerField()  # In square feet
    price = models.DecimalField(max_digits=12, decimal_places=2)  # In USD
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    property_type = models.CharField(max_length=50, blank=True)
    year_built = models.PositiveIntegerField(null=True, blank=True)
    
    # Analysis results
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    annual_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # In percentage
    area_growth_score = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    predicted_value_growth = models.JSONField(null=True, blank=True)  # Store as JSON array
    comparable_properties = models.JSONField(null=True, blank=True)  # Store as JSON array
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis for {self.location}"
