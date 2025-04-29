from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Property, RentalAgreement
import json

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.wallet_address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
        
        # Create a test user
        self.user = User.objects.create(
            wallet_address=self.wallet_address,
            email='test@example.com',
            full_name='Test User'
        )
    
    def test_login_with_valid_signature(self):
        # In a real test, we would generate a valid signature
        # For this test, we'll mock the verify_signature function
        from unittest.mock import patch
        with patch('api.blockchain.verify_signature', return_value=True):
            response = self.client.post(self.login_url, {
                'wallet_address': self.wallet_address,
                'signature': '0x1234567890abcdef',
                'message': 'Sign in to OpulRent'
            })
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
            self.assertEqual(response.data['user']['wallet_address'], self.wallet_address)
    
    def test_login_with_invalid_signature(self):
        # Mock verify_signature to return False
        from unittest.mock import patch
        with patch('api.blockchain.verify_signature', return_value=False):
            response = self.client.post(self.login_url, {
                'wallet_address': self.wallet_address,
                'signature': '0xinvalidsignature',
                'message': 'Sign in to OpulRent'
            })
            
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class PropertyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.properties_url = reverse('property-list')
        
        # Create a test user
        self.user = User.objects.create(
            wallet_address='0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            email='test@example.com',
            full_name='Test User'
        )
        
        # Create a test property
        self.property = Property.objects.create(
            owner=self.user,
            name='Test Property',
            location='Test Location',
            description='Test Description',
            price=1.5,
            rental_price=2000,
            bedrooms=2,
            bathrooms=2,
            size=1200,
            ipfs_hash='QmTest',
            listing_type='buy'
        )
        
        # Authenticate the client
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_list_properties(self):
        response = self.client.get(self.properties_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Property')
    
    def test_create_property(self):
        data = {
            'name': 'New Property',
            'location': 'New Location',
            'description': 'New Description',
            'price': 2.5,
            'rental_price': 3000,
            'bedrooms': 3,
            'bathrooms': 2.5,
            'size': 1500,
            'ipfs_hash': 'QmNew',
            'listing_type': 'rent'
        }
        
        response = self.client.post(self.properties_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Property')
        self.assertEqual(Property.objects.count(), 2)

class InvestmentAnalysisTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.analysis_url = reverse('investment-analysis')
        
        # Create a test user
        self.user = User.objects.create(
            wallet_address='0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            email='test@example.com',
            full_name='Test User'
        )
        
        # Authenticate the client
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_investment_analysis(self):
        data = {
            'location': 'New York',
            'size': 1200,
            'price': 500000,
            'bedrooms': 2,
            'bathrooms': 2,
            'property_type': 'Apartment',
            'year_built': 2010
        }
        
        # Mock the analyze_investment function
        from unittest.mock import patch
        mock_result = {
            'monthly_rent': 2500.0,
            'annual_roi': 6.0,
            'area_growth_score': 8,
            'predicted_value_growth': [510000, 520200, 530604, 541216, 552040],
            'comparable_properties': [
                {'name': 'Similar Property 1', 'price': 480000, 'roi': 5.8},
                {'name': 'Similar Property 2', 'price': 520000, 'roi': 6.2},
                {'name': 'Similar Property 3', 'price': 495000, 'roi': 5.9}
            ]
        }
        
        with patch('api.ml_model.analyze_investment', return_value=mock_result):
            response = self.client.post(self.analysis_url, data)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['monthly_rent'], 2500.0)
            self.assertEqual(response.data['annual_roi'], 6.0)
            self.assertEqual(response.data['area_growth_score'], 8)
