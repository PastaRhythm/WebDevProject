# This file manages most of the database.

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

import os, sys
scriptdir = os.path.dirname(os.path.abspath(__file__))
dbfile = os.path.join(scriptdir, "app.sqlite3")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

if __name__ == '__main__':
    conf = input("Are you sure you want to recreate the database, DELETING ALL PREEXISTING DATA? (Y/n): ")
    if conf == "Y":
        with app.app_context():
            db.drop_all()
            db.create_all()
        print("Generated new database.")
    else:
        print("Aborted.")