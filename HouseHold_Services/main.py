from flask_security import SQLAlchemyUserDatastore, Security
from collections import Counter
from application.worker import *
from application.tasks import *
from celery.result import AsyncResult
from celery.schedules import crontab
from celery import shared_task
import matplotlib.pyplot as plt
from flask import Flask,render_template,request,jsonify,send_from_directory,send_file
from config import DevelopmentConfig

#####################################################################################################################################################
def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    excel.init_excel(app)
    from application.sec import datastore
    app.security = Security(app,datastore)
    with app.app_context():
        import application.views
    return app
#####################################################################################################################################################
# datastore = SQLAlchemyUserDatastore(db,Influencer,Role)
# app.security = Security(app,datastore)
# mail=Mail()

# cache.init_app(app)

# mail=Mail()
# mail.init_app(app)
app = create_app()
celery_app=celery_init_app(app)
#############################################################      This is the Coding Section       ################################################
##################################################################################################################################################
#################################################################       CELERY TASKS       ######################################################

@app.get('/download-csv')
def download_csv():
    task = create_service_req_csv.delay()
    return jsonify({"task-id":task.id})

@app.get('/get-csv/<string:task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename,as_attachment=True)
    else:
        return jsonify({"Message":"Task-Pending"}) , 404

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab( hour=0, minute=20),
        daily_remainder.s('DAILY REMAINDER'),
    )

@celery_app.on_after_configure.connect
def setup_periodic_tasks_monthly(sender, **kwargs):
    sender.add_periodic_task(
        crontab( hour=0, minute=23),
        monthly_report.s('MONTHLT REPORT'),
    )


if __name__ == "__main__":
    app.run(debug = True)

#####################################################################################################################################################
#####################################################################################################################################################
#####################################################################################################################################################