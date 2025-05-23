from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
db = SQLAlchemy()
class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.user_id'), primary_key=True)
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'), primary_key=True)

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

class Service(db.Model):
    __tablename__ = 'service'
    service_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    time_required = db.Column(db.Integer, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    review = db.Column(db.Text, nullable=True)
    def __repr__(self):
        return f'<Service {self.service_name}>'
    def to_dict(self):
        return {
            "service_id": self.service_id,
            "service_name": self.service_name,
            "description": self.description,
            "time_required": self.time_required,
            "base_price": self.base_price,
            "review": self.review
        }

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    fullname = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(15), default = "NIL")
    address = db.Column(db.String(200), default = "NIL")
    pin_code = db.Column(db.String(6), nullable=False)
    notification = db.Column(db.Text, nullable=True)
    blocked = db.Column(db.Integer, nullable=False, default=0)
    balance = db.Column(db.Float, default=10000.0)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean,default =True)
    # Relationships
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))
    professional = db.relationship("Professional", uselist=False, backref="user")
    def __repr__(self):
        return f'<User {self.fullname}>'

    def has_role(self, role):
        return super().has_role(role)

    def get_auth_token(self) -> str | bytes:
        return super().get_auth_token()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "fullname": self.fullname,
            "phone": self.phone,
            "address": self.address,
            "pin_code": self.pin_code,
            "notification": self.notification,
            "blocked": self.blocked,
            "balance": self.balance,
            "fs_uniquifier": self.fs_uniquifier,
            "roles": [role.name for role in self.roles],  # Assuming `Role` model has a 'name' field
            "professional": self.professional.to_dict() if self.professional else None,
        }

class Professional(db.Model):
    __tablename__ = 'professional'
    professional_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cid =  db.Column(db.Integer, db.ForeignKey('user.user_id'))
    service_type = db.Column(db.String(100), nullable=True)
    Experience = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    profile_picture = db.Column(db.String(200))
    rating = db.Column(db.Integer, nullable=False, default=0)
    approved = db.Column(db.Integer, nullable=False, default=0)
    blocked = db.Column(db.Integer, nullable=False, default=0)
    revenue = db.Column(db.Float,default = 0.0)
    ## relationship
    def __repr__(self):
        return f'<Professional {self.user.fullname}>'
    def to_dict(self):
        user = User.query.get(self.cid)
        return {
            "professional_id": self.professional_id,
            "user_id": self.cid,
            "service_type": self.service_type,
            "experience": self.Experience,
            "phone": user.phone,
            "address": user.address,
            "profile_picture": self.profile_picture,
            "pin_code": user.pin_code,
            "notification": user.notification,
            "rating": self.rating,
            "approved": self.approved,
            "blocked": self.blocked,
            "revenue": self.revenue,
            "email": user.email,
            "fullname" : user.fullname,
        }

class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), nullable=False)
    service_name = db.Column(db.String(120), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.professional_id'), nullable=False)
    professional_name = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    user_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # ("Requested", "In Progress", "Completed", "Rejected")
    request_date = db.Column(db.DateTime, nullable=False)
    completion_date = db.Column(db.DateTime)
    remarks = db.Column(db.Integer, nullable=False, default=0)
    closed = db.Column(db.Integer, nullable=False, default=0)

    # Relationships
    service = db.relationship('Service', backref=db.backref('requests', lazy=True))
    professional = db.relationship('Professional', backref=db.backref('requests', lazy=True))
    user = db.relationship('User', backref=db.backref('requests', lazy=True))

    def __repr__(self):
        return f'<ServiceRequest {self.status}>'

    def to_dict(self):
        return {
            "request_id": self.request_id,
            "service_id": self.service_id,
            "service_name": self.service_name,
            "professional_id": self.professional_id,
            "professional_name": self.professional_name,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "status": self.status,
            "request_date": self.request_date,
            "completion_date": self.completion_date,
            "remarks": self.remarks,
            "closed": self.closed,
            "service": self.service.to_dict() if self.service else None,
            "professional": self.professional.to_dict() if self.professional else None,
            "user": self.user.to_dict() if self.user else None
        }
