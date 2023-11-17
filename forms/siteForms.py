from flask_wtf import FlaskForm
from wtforms.fields import SubmitField, StringField, SelectField, FileField
from wtforms.validators import InputRequired, Regexp

class NewSiteForm(FlaskForm):
    host_name = StringField("Host Name: ", validators=[InputRequired()])
    # pricing_plan = SelectField("Pricing Plan: ", coerce=int)

    submit = SubmitField("Register")

class UploadFilesForm(FlaskForm):
    # This gives a file path
    zip_file = FileField('Zip File, preferably containing index.html at root', validators = [InputRequired()])

    submit = SubmitField("Set website files to selected")