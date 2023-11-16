from app import db

class Website(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    null = db.Column(db.Unicode, nullable=False)
    name = db.Column(db.Unicode, nullable=False)
    docker_id = db.Column(db.Unicode, nullable=False)
    volume_path = db.Column(db.Unicode, nullable=False)
    image = db.Column(db.Unicode, nulable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('websites', lazy=True))