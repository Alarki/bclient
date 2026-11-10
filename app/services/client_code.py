import re

class ClientCodeGenerator:
    """Handles the logic for generating unique 6-character client codes."""

    @staticmethod
    def _get_alpha_prefix(name: str) -> str:
        """Extracts and formats the 3-letter prefix from the client name."""
        # 1. Clean the name (keep only letters and spaces)
        clean_name = re.sub(r'[^a-zA-Z\s]', '', name).strip()
        
        # If the name is completely empty after cleaning, default to AAA
        if not clean_name:
            return "AAA"

        words = clean_name.split()
        prefix = ""

        # 2. If 3 or more words, take the first letter of the first 3 words
        if len(words) >= 3:
            prefix = "".join([word[0].upper() for word in words[:3]])
        
        # 3. If 1 or 2 words, take the first 3 letters of the combined words
        else:
            combined = "".join(words).upper()
            prefix = combined[:3]

        # 4. Pad if shorter than 3 characters
        if len(prefix) < 3:
            for char in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
                if len(prefix) >= 3:
                    break
                # Only add the letter if it's not already in the prefix
                if char not in prefix:
                    prefix += char

        return prefix

    @classmethod
    def generate_unique_code(cls, name: str, db_session) -> str:
        """Generates the full 6-character code by finding the next available number."""
        from app.models.client import Client
        
        prefix = cls._get_alpha_prefix(name)
        
        # Start counting from 1 and go up to 999
        for i in range(1, 1000):
            candidate = f"{prefix}{i:03d}"
            
            # Check if this code already exists in the database
            exists = db_session.query(Client).filter(Client.client_code == candidate).first()
            
            if not exists:
                return candidate
                
        # If we exhausted 999 numbers for a prefix (extremely rare)
        raise ValueError("Maximum number of clients reached for this prefix.")