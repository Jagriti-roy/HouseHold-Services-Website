# # tasks.py
from .mail_service import send_message
from celery import shared_task
import flask_excel as excel
from .models import *
from flask_mail import Message
from sqlalchemy import or_

@shared_task(ignore_result=False)
def create_service_req_csv():
    serv_req_res = ServiceRequest.query.with_entities(ServiceRequest.request_id,ServiceRequest.service_id,
                                            ServiceRequest.professional_id,ServiceRequest.user_id,ServiceRequest.request_date
                                            ,ServiceRequest.remarks).all()
    csv_output = excel.make_response_from_query_sets(query_sets=serv_req_res,column_names=["request_id","service_id","professional_id","user_id","request_date","remarks"],file_type="csv")
    print(csv_output)
    filename="service_req.csv"
    with open(filename,'wb') as f:
        f.write(csv_output.data)
    return filename


@shared_task(ignore_result=True)
def daily_remainder(subject):
    serviceReqs = ServiceRequest.query.filter(
        or_(
            ServiceRequest.status == "Requested",
            ServiceRequest.status == "In Progress"
        )
    ).all()
    for i in serviceReqs:
        professObj = Professional.query.filter_by(professional_id = i.professional_id).first()
        userobj = User.query.filter_by(user_id = professObj.cid).first()
        email = userobj.email
        send_message(email,subject,"Please Check Your Services Request")
    return "OK"


@shared_task(ignore_result=True)
def monthly_report(subject):
    serviceReqs = ServiceRequest.query.all()
    for i in serviceReqs:
        customerObj = User.query.filter_by(user_id = i.user_id).first()
        email = customerObj.email
        servReqs = ServiceRequest.query.filter_by(user_id = customerObj.user_id).all()
        numberServReq = len(serviceReqs)
        send_message(email,subject,"You are having "+str(numberServReq)+" of ServiceRequests")
    return "OK"