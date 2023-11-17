from cryptography.fernet import Fernet
from passlib.hash import argon2

class UpdatedHasher:
    """Upgrades the Dropbox for modern systems using Argon2"""
    def __init__(self, pepper_key: bytes):
        self.pepper = Fernet(pepper_key)

    def hash(self, pwd: str) -> bytes:
        # hash with argon2
        hash: str = argon2.using(rounds=10).hash(pwd)
        # convert this unicode hash string into bytes before encryption
        hashb: bytes = hash.encode('utf-8')
        # encrypt this hash using the global pepper
        pep_hash: bytes = self.pepper.encrypt(hashb)
        return pep_hash

    def check(self, pwd: str, pep_hash: bytes) -> bool:
        # decrypt the hash using the global pepper
        hashb: bytes = self.pepper.decrypt(pep_hash)
        # convert this hash back into a unicode string
        hash: str = hashb.decode('utf-8')
        # check if the given password matches this hash
        return argon2.verify(pwd, hash)

    @staticmethod
    def random_pepper() -> bytes:
        return Fernet.generate_key()
    
import os, sys
scriptdir = os.path.dirname(os.path.abspath(__file__))
pepfile = os.path.join(scriptdir, "pepper.bin")

# Read the pepper and set up the password hasher
with open(pepfile, 'rb') as fin:
	pepper_key = fin.read()
pwd_hasher = UpdatedHasher(pepper_key)
    
if __name__ == '__main__':
    conf = input("Are you sure you want to generate a new pepper? (Y/n): ")
    if conf == "Y":
        pepper_key = UpdatedHasher.random_pepper()
        with open("pepper.bin", 'wb') as fout:
            fout.write(pepper_key)
        print("Generated new pepper.")
    else:
        print("Aborted.")