from django.contrib import admin
from django.utils.html import format_html
from .models import User, Property, PropertyImage, RentalAgreement, InvestmentAnalysis

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('wallet_address', 'email', 'full_name', 'kyc_status', 'kyc_submission_date', 'is_active')
    list_filter = ('kyc_status', 'is_active', 'is_staff')
    search_fields = ('wallet_address', 'email', 'full_name')
    readonly_fields = ('date_joined',)
    fieldsets = (
        (None, {'fields': ('wallet_address', 'email', 'full_name')}),
        ('KYC Information', {'fields': ('kyc_status', 'kyc_document', 'kyc_submission_date', 'kyc_notes')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('date_joined', 'last_login')}),
    )

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'price', 'listing_type', 'owner_display', 'is_active')
    list_filter = ('listing_type', 'is_active', 'created_at')
    search_fields = ('name', 'location', 'description', 'owner__wallet_address')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PropertyImageInline]
    
    def owner_display(self, obj):
        return obj.owner.wallet_address
    owner_display.short_description = 'Owner'

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property_name', 'image_preview', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    
    def property_name(self, obj):
        return obj.property.name
    property_name.short_description = 'Property'
    
    def image_preview(self, obj):
        return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
    image_preview.short_description = 'Image Preview'

@admin.register(RentalAgreement)
class RentalAgreementAdmin(admin.ModelAdmin):
    list_display = ('property_name', 'tenant_display', 'start_date', 'end_date', 'monthly_rent', 'status')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('property__name', 'tenant__wallet_address', 'tenant__full_name')
    readonly_fields = ('created_at', 'updated_at')
    
    def property_name(self, obj):
        return obj.property.name
    property_name.short_description = 'Property'
    
    def tenant_display(self, obj):
        return obj.tenant.wallet_address
    tenant_display.short_description = 'Tenant'

@admin.register(InvestmentAnalysis)
class InvestmentAnalysisAdmin(admin.ModelAdmin):
    list_display = ('location', 'price', 'user_display', 'monthly_rent', 'annual_roi', 'area_growth_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('location', 'user__wallet_address')
    readonly_fields = ('created_at',)
    
    def user_display(self, obj):
        return obj.user.wallet_address
    user_display.short_description = 'User'
