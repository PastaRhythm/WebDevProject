from app import db, pwd_hasher
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.Unicode, nullable=False)
    lname = db.Column(db.Unicode, nullable=False)
    password_hash = db.Column(db.LargeBinary)
    email = db.Column(db.Unicode, nullable=False)
    billing_address = db.Column(db.Unicode, nullable=False)
    volume_path = db.Column(db.Unicode)
    status = db.Column(db.Integer)

    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.password_hash = pwd_hasher.hash(pwd)
    
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.password_hash)