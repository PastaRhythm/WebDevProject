from flask_wtf import FlaskForm
from wtforms.fields import PasswordField, SubmitField, EmailField, StringField, TextAreaField
from wtforms.validators import InputRequired, Email, EqualTo, Length, Optional

class RegisterForm(FlaskForm):
    email = EmailField("Email: ", validators=[InputRequired(), Email()])
    password = PasswordField("Password: ", 
        validators=[InputRequired(), Length(min=8, max=256)])
    confirm_password = PasswordField("Confirm Password: ", 
        validators=[EqualTo('password')])
    fname = StringField("First Name: ", validators=[InputRequired()])
    lname = StringField("Last Name: ", validators=[InputRequired()])
    billing_address = TextAreaField("Billing Address: ", validators=[InputRequired()])
    submit = SubmitField("Register")

class LoginForm(FlaskForm):
    email = EmailField("Email: ", validators=[InputRequired(), Email()])
    password = PasswordField("Password: ", 
        validators=[InputRequired(), Length(min=8, max=256)])
    submit = SubmitField("Login")

class ChangeInfoForm(FlaskForm):
    current_password = PasswordField(validators=[InputRequired(), Length(min=8, max=256)])
    fname = StringField()
    lname = StringField()
    email = EmailField(validators=[Optional(), Email()])
    new_password = PasswordField(validators=[Optional(), Length(min=8, max=256)])
    confirm_password = PasswordField(validators=[EqualTo('new_password')])
    submit = SubmitField("Submit")