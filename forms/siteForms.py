from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.fields import SubmitField, StringField, SelectField, IntegerField
from wtforms.validators import InputRequired, NumberRange

class NewSiteForm(FlaskForm):
    host_name = StringField("Hostname: ", validators=[InputRequired()])
    name_lbl = StringField("Site Name: ", validators=[InputRequired()])
    desc_lbl = StringField("Site Description: ", validators=[InputRequired()])
    # pricing_plan = SelectField("Pricing Plan: ", coerce=int)

    submit = SubmitField("Create")

class UploadFilesForm(FlaskForm):
    # This gives a file path
    zip_file = FileField('Zip File: ', validators = [FileRequired(), FileAllowed(['zip'], "zip files only")])

    submit = SubmitField("Update Website")

class ShareSiteForm(FlaskForm):
    # This gives a file path
    other_id = StringField('Share with (enter their id number): ', validators = [InputRequired()])

    submit = SubmitField("Share")