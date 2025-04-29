import json
import os
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account.messages import encode_defunct
from django.conf import settings

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Load contract ABI
def load_contract_abi():
    try:
        with open(settings.CONTRACT_ABI_PATH, 'r') as f:
            contract_abi = json.load(f)
        return contract_abi
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading contract ABI: {e}")
        return None

# Initialize contract
contract_abi = load_contract_abi()
contract_address = settings.CONTRACT_ADDRESS

if contract_abi and contract_address:
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
else:
    contract = None

def verify_signature(wallet_address, signature, message):
    """
    Verify that the signature was signed by the wallet address
    """
    try:
        # Convert wallet address to checksum address
        wallet_address = w3.to_checksum_address(wallet_address)
        
        # Recover the address from the signature
        message_hash = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(message_hash, signature=signature)
        
        # Check if the recovered address matches the provided address
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False

def mint_property_nft(property_id, ipfs_hash, price, owner_address):
    """
    Mint a new property NFT on the blockchain
    """
    if not contract:
        raise ValueError("Contract not initialized")
    
    try:
        # In a real implementation, this would use a private key to sign and send the transaction
        # For demo purposes, we'll just return mock values
        token_id = str(int(property_id.hex[:8], 16))  # Convert part of UUID to integer
        tx_hash = f"0x{os.urandom(32).hex()}"  # Random transaction hash
        
        return token_id, tx_hash
    except Exception as e:
        print(f"Error minting property NFT: {e}")
        raise
