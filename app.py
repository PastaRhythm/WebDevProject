from flask import Flask, request, session, abort
from flask import redirect, url_for, render_template, flash
from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField, SelectField, IntegerField
from wtforms.validators import InputRequired, NumberRange
from flask_sqlalchemy import SQLAlchemy

# identify the script directory to locate the database and helper files
import os, sys
scriptdir = os.path.dirname(os.path.abspath(__file__))
# add the directory with this script to the Python path
sys.path.append(scriptdir)
# identify the full path to the database file
dbfile = os.path.join(scriptdir, "app.sqlite3")

# configure this web application
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = "ilovepenguinsveryverymuch"
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


@app.route("/")
def index():
	return render_template('homepage.html')

@app.get("/login/")
def login():
	return render_template('login.html')

@app.post("/login/")
def handle_login():
	return redirect(url_for('login'))


@app.get("/register/")
def register():
	return render_template('register.html')

@app.post("/register/")
def handle_register():
	return redirect(url_for('register'))


@app.get("/dashboard/")
def dashboard():
    return render_template('dashboard.html')


if __name__ == '__main__':
	app.run()