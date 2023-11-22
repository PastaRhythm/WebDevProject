from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.fields import SubmitField, StringField, SelectField
from wtforms.validators import InputRequired, Regexp

class NewSiteForm(FlaskForm):
    host_name = StringField("Host Name: ", validators=[InputRequired()])
    # pricing_plan = SelectField("Pricing Plan: ", coerce=int)

    submit = SubmitField("Create")

class UploadFilesForm(FlaskForm):
    # This gives a file path
    zip_file = FileField('Zip File: ', validators = [FileRequired(), FileAllowed(['zip'], "zip files only")])

    submit = SubmitField("Set website files to selected")