import string
from flask import Flask
from flask import redirect, url_for, render_template
from flask import request, session, flash
from flask_login import LoginManager, login_required
from flask_login import login_user, logout_user, current_user

#database
from flask_sqlalchemy import SQLAlchemy

# Add this directory to the Python path
import os, sys
scriptdir = os.path.dirname(os.path.abspath(__file__))
dbfile = os.path.join(scriptdir, "app.sqlite3")
sys.path.append(scriptdir)

import docker
import json

from constants import TRAEFIK_CONTAINER_NAME

#traefik router class
class TraefikApp(Flask):
	def __init__(self, *args, **kwargs):
		'''class that creates a traefik container when the app starts if it does not exist'''
		super(TraefikApp, self).__init__(*args, **kwargs)

		#check if the traefik container exists
		client = docker.from_env()
		try:
			_ = client.containers.get(TRAEFIK_CONTAINER_NAME)
		except docker.errors.NotFound as e:
			print("Creating traefik container!")
			try:
				_ = client.containers.run(
					"traefik:latest",
					name = TRAEFIK_CONTAINER_NAME,
					detach=True,
					ports={'80/tcp': '80'},
					command = [
						"--api.insecure=true",
						"--providers.docker=true",
						"--providers.docker.exposedbydefault=false",
						"--entrypoints.web.address=:80"
					],
					labels = {
						'traefik.enable': 'true',
						'traefik.http.routers.traefik.rule': 'Host(`localhost`)',
						'traefik.http.routers.traefik.entrypoints': 'web',
						'traefik.http.routers.traefik.service': 'api@internal'
					},
					volumes = {
						"/var/run/docker.sock": {'bind': f"/var/run/docker.sock", 'mode': 'rw'}
					}
				)

				print("Traefik container created!")
			except docker.errors.APIError as e:
				print(f"Error creating traefik container: {e}")
				raise   #raise most recently caught exception
		finally:
			client.close()


# configure this web application
app = TraefikApp(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = "ilovepenguinsveryverymuch"
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import from various files
from database_manager import User, Website, db, seed_db
from forms.loginForms import RegisterForm, LoginForm
from docker_functions.docker_site_funcs import *

#init database
db.init_app(app)

# Prepare and connect the LoginManager to this app
login_manager = LoginManager()
login_manager.init_app(app)
# function name of the route that has the login form (so it can redirect users)
login_manager.login_view = 'login' # type: ignore
# Function that gets a user with the given id from the database.
@login_manager.user_loader
def load_user(uid: int) -> User:
    return User.query.get(int(uid))

@app.route("/")
def index():
	return render_template('homepage.html')

@app.get("/login/")
def login():
	form = LoginForm()
	return render_template('login.html', form=form)

@app.post("/login/")
def handle_login():
	form = LoginForm()
	if form.validate():
		# try to get the user associated with this email address
		user = User.query.filter_by(email=form.email.data).first()
		# if this user exists and the password matches
		if user is not None and user.verify_password(form.password.data):
			# log this user in through the login_manager
			login_user(user)
			# redirect the user to the page they wanted or the home page
			next = request.args.get('next')
			if next is None or not next.startswith('/'):
				next = url_for('index')
			return redirect(next)
		else: # if the user does not exist or the password is incorrect
			# flash an error message and redirect to login form
			flash('Invalid email address or password')
			return redirect(url_for('login'))
	else: # if the form was invalid
		# flash error messages and redirect to get login form again
		for field, error in form.errors.items():
			flash(f"{field}: {error}")
		return redirect(url_for('login'))


@app.get("/register/")
def register():
	form = RegisterForm()
	return render_template('register.html', form=form)

@app.post("/register/")
def handle_register():
	form = RegisterForm()
	if form.validate():
		# check if there is already a user with this email address
		user = User.query.filter_by(email=form.email.data).first()
		# if the email address is free, create a new user and send to login
		if user is None:
			user = User(
				email=form.email.data,
				password=form.password.data,
				fname=form.fname.data,
				lname=form.lname.data,
				billing_address=form.billing_address.data,
				status = 1
			)
			db.session.add(user)
			db.session.commit()
			return redirect(url_for('login'))
		else: # if the user already exists
			# flash a warning message and redirect to get registration form
			flash('There is already an account with that email address')
			return redirect(url_for('register'))
	else: # if the form was invalid
		# flash error messages and redirect to get registration form again
		for field, error in form.errors.items():
			flash(f"{field}: {error}")
		return redirect(url_for('register'))

@app.get("/logout/")
@login_required
def get_logout():
	logout_user()
	flash('You have been logged out')
	return redirect(url_for('index'))

@app.get("/dashboard/")
@login_required
def dashboard():
    return render_template('dashboard.html')

#routes for showing details about a user's sites
@app.get('/sites/')
def show_sites():
	return render_template('sites.html')

@app.get('/sites_data/')
def sites_json():
	#get current user
	user = User.query.first()	#TODO: change this to get the current user

	#load all site models associated with that user
	websites = user.websites

	#jsonify that data
	json_data = json.dumps([
		{
			'id': website.id, 'name': website.name, 'docker_id': website.docker_id,
			'volume_path': website.volume_path, 'image': website.image, 'hostname': website.hostname,
			'user_id': website.user_id
		}
		for website in websites
	])

	#return the json string
	return json_data
	

@app.get("/test_create_route/")
def test_create():

	user = User.query.get(int(1))
	hostname = 'host1.dockertest.internal'

	success = create_site(user, hostname)
	return "test create"

if __name__ == '__main__':
	#seed_db(app)
	app.run()