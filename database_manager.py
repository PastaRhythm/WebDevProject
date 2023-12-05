# This file manages most of the database.

from flask import Flask
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from updated_hasher import pwd_hasher

import os, sys

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.Unicode, nullable=False)
    lname = db.Column(db.Unicode, nullable=False)
    password_hash = db.Column(db.LargeBinary)
    email = db.Column(db.Unicode, nullable=False)
    billing_address = db.Column(db.Unicode, nullable=False)
    role = db.Column(db.Integer, nullable=False) # 1 is user, 2 is admin, 3 is banned
    websites = db.relationship('Website', backref='user')
    shared_with_me = db.relationship('PermissionLink', backref='user')

    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.password_hash = pwd_hasher.hash(pwd)
    
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.password_hash)

class Website(db.Model):
    __tablename__ = 'Websites'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode, nullable=False)
    docker_id = db.Column(db.Unicode, nullable=False)
    volume_path = db.Column(db.Unicode, nullable=False)
    image = db.Column(db.Unicode, nullable=False)
    hostname = db.Column(db.Unicode, nullable=False)
    plan = db.Column(db.Integer, nullable=False) # 1 is basic, 2 is middle, 3 is top
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    shared_with = db.relationship('PermissionLink', backref='site')

class PermissionLink(db.Model):
    __tablename__ = 'PermissionLink'
    # id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('Websites.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), primary_key=True)

# if __name__ == '__main__':
#     conf = input("Are you sure you want to recreate the database, DELETING ALL PREEXISTING DATA? (Y/n): ")
#     if conf == "Y":
def seed_db(app):
    with app.app_context():
        # Recreate databases
        db.drop_all()
        db.create_all()

        # Generate test data
        user1 = User(fname="Billy", lname="Bob", password="testtest", email="billy.bob@gmail.com",
                        billing_address = "Nowhere", role=1)
        user2 = User(fname="Luke", lname="Skywalker", password="theforce", email="luke.skywalker@gmail.com",
                        billing_address = "A galaxy far, far away", role=1)
        site1 = Website(name="Billy's Farm", docker_id="32987310857", volume_path="/bb",
                        image="httpd:2.4", user=user1, hostname="io.io", plan=1)
        site2 = Website(name="Luke's Handbags", docker_id="238479", volume_path="/ls_bag",
                        image="httpd:2.4", user=user2, hostname="org.org", plan=2)
        site3 = Website(name="Luke's Therapy Sessions", docker_id="1010810108", volume_path="/ls_therapy",
                        image="httpd:2.4", user=user2, hostname="com.com", plan=3)
        
        users = [user1, user2]
        sites = [site1, site2, site3]

        db.session.add_all(users)
        db.session.add_all(sites)

        db.session.commit()

    print("Generated new database.")
# else:
#     print("Aborted.")