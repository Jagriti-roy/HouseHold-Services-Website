from flask_security.utils import hash_password,verify_password,login_user,logout_user
from flask import current_app as app, jsonify, request, render_template, send_file,send_from_directory,logging,current_app as app
from flask_security import auth_required, roles_required
from .models import db,User,Professional,Service,ServiceRequest,Role,RolesUsers
from .sec import datastore
from celery.result import AsyncResult
from .tasks import create_service_req_csv
import json
import os
from werkzeug.utils import secure_filename
import matplotlib.pyplot as plt
from datetime import datetime,timedelta
from collections import Counter
import uuid
import numpy as np
##################################################################################################################################################
###############################################################       Handle 404 errors       ####################################################

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

##################################################################################################################################################
###############################################################        Serving the APP        ####################################################

@app.route('/<path:path>')
def serve_vue_app(path):
    return send_from_directory(app.static_folder, 'Main.html')

@app.route('/')
def index():
    return send_from_directory('static', 'Main.html')

############################################################################################################################################################
#################################################################        STATISTICS       #############################################################

@app.route('/api/admin_statistics',methods=["GET"])
@auth_required("token")
def admin_statistics():
    users = RolesUsers.query.filter_by(role_id=3).count()
    total_users = users

    professionals = Professional.query.all()
    total_serv_prof = len(professionals)

    services = Service.query.all()
    total_services = len(services)

    serv_req = ServiceRequest.query.all()
    total_serv_req = len(serv_req)

    reviews = []
    for i in services:
        if not i.review==None:
            reviews.append(i.review)
    total_reviews = len(reviews)

    max_rate = 0
    max_rated_prof = 'No Professionals Signed Up'
    avg_prof_rating = 0
    if total_serv_prof > 0:
        total_prof_rating = 0
        for i in professionals:
            total_prof_rating+=i.rating
            if i.rating>max_rate:
                max_rate = i.rating
        avg_prof_rating = total_prof_rating / total_serv_prof

        for i in professionals:
            if i.rating == max_rate:
                max_rated_prof = i.user.fullname
    review_dict = {}
    for i in services:
        review_text = json.loads(i.review) if i.review not in [None, "null"] else []
        review_dict[i.service_name] = len(review_text)

    most_popular_service = ''
    max=0
    for i in review_dict:
        if review_dict[i] > max:
            max = review_dict[i]
            most_popular_service = i
    ########################  BAR CHART URL SERVICES  #########################
    services = [service.service_name for service in services]

    ########################  PLOT CHART URL SERVICES  #########################
    service_time = service_usage_over_time()
    request_made = request_made_per_service(services)
    ########################  PIE CHART URL SERVICES  #########################
    categories,counts = plot_service_type_distribution(top_n=5)
    print(categories)  # Example: ['Service A', 'Service B', 'Others']
    print(counts)
    price_time = get_price_vs_time()

    time_bins,time_distribution = get_service_time_distribution()

    top_5 = top_5_services_requested()
    return jsonify({
        'total_users':total_users,
        'total_serv_prof':total_serv_prof,
        'total_services':total_services,
        'total_serv_req':total_serv_req,
        'total_reviews':total_reviews,
        'avg_prof_rating':avg_prof_rating,
        'max_rated_prof':max_rated_prof,
        'request_made_per_service':request_made,
        'most_popular_service' : most_popular_service,
        'top_5_services_requested': top_5,
        'service_time' : service_time,
        "categories" : categories,
        "counts": counts,
        'time_bins' : time_bins,
        "time_distribution": time_distribution,
        "price_time" : price_time
    })

def get_price_vs_time(household_services = Service.query.all()):
    """
    Returns service prices and time required for a scatter plot.
    """
    services = [service.service_name for service in household_services]
    prices = [service.base_price for service in household_services]
    times = [service.time_required for service in household_services]
    return {"services": services, "prices": prices, "times": times}

def request_made_per_service(services):
    requests_made = {}
    for i in services:
        requests_made[i] = ServiceRequest.query.filter_by(service_name = i).count()
    return requests_made

def service_usage_over_time():
    service_requests = ServiceRequest.query.all()

    # Get the current date
    current_date = datetime.now().date()

    # Calculate the date of 5 days ago
    five_days_ago = current_date - timedelta(days=5)

    # Get dates from the service requests
    dates = [str(request.request_date.date()) for request in service_requests]

    # Filter out dates that are not in the last 5 days
    recent_dates = [date for date in dates if datetime.strptime(date, '%Y-%m-%d').date() > five_days_ago]

    # Count occurrences of each date in the filtered list
    date_counts = Counter(recent_dates)

    # Sort the dates
    sorted_dates = sorted(date_counts.keys())
    values = [date_counts[date] for date in sorted_dates]

    # Return the filtered and sorted date counts
    return {date: date_counts[date] for date in sorted_dates}

def top_5_services_requested():
    # Get all service requests from the database
    service_requests = ServiceRequest.query.all()
    
    # Extract the service type or name from each request (assuming it's an attribute in the model)
    services = [request.service_name for request in service_requests]  # Replace 'service_type' with the actual field
    
    # Count the frequency of each service using Counter
    service_counts = Counter(services)
    
    # Sort services by count in descending order and get the top 5
    top_services = service_counts.most_common(5)  # Returns a list of tuples [(service, count), ...]
    top_5 = {}
    for (service,count) in top_services:
        top_5[service] = count
    # Return the top 5 services
    return top_5

def plot_service_type_distribution(threshold_percentage=5, top_n=None):
    # Fetch all service requests
    service_requests = ServiceRequest.query.filter_by(status="completed").all()

    # Extract service names
    service_names = [request.service_name for request in service_requests]

    # Count occurrences of each service type
    service_counts = Counter(service_names)

    # Total number of requests
    total_requests = sum(service_counts.values())

    # Group services contributing less than the threshold percentage into "Others"
    grouped_counts = {}
    others_count = 0
    for service, count in service_counts.items():
        if (count / total_requests) * 100 >= threshold_percentage:
            grouped_counts[service] = count
        else:
            others_count += count

    if others_count > 0:
        grouped_counts["Others"] = others_count

    # Sort services by count in descending order
    sorted_services = sorted(grouped_counts.items(), key=lambda x: x[1], reverse=True)

    # Limit to top_n services if specified
    if top_n:
        top_services = sorted_services[:top_n]
        remaining_services = sorted_services[top_n:]

        # Add remaining counts to "Others"
        others_count = sum([count for _, count in remaining_services])
        top_services.append(("Others", others_count))
        sorted_services = top_services

    # Separate categories and counts
    categories = [service for service, count in sorted_services]
    counts = [count for service, count in sorted_services]

    return categories, counts

def plot_histogram_image_url():
    services = Service.query.all()
    times = [service.time_required for service in services]

    if not times:
        print("No data available to plot.")
        return None

    plt.figure(figsize=(10, 6))
    plt.hist(times, bins=10, color='skyblue', edgecolor='black')
    plt.xlabel('Time Required (minutes)')
    plt.ylabel('Frequency')
    plt.title('Distribution of Time Required for Services')
    plt.grid(axis='y')

    file_path = 'static/uploads/plot_histogram_image_url.png'
    plt.tight_layout()
    plt.savefig('./'+file_path)
    plt.close()
    return f'/{file_path}'


@app.route('/api/user_statistics', methods=['GET'])
@auth_required("token")
def user_statistics():
    cust_email = request.args.get('email')
    custObj = datastore.find_user(email = cust_email)
    serReqs = ServiceRequest.query.filter_by(user_id = custObj.user_id).all()
    total_request_made = len(serReqs)
    Requested = ServiceRequest.query.filter_by(user_id = custObj.user_id, status = "Requested").count()
    Completed = ServiceRequest.query.filter_by(user_id = custObj.user_id, status = "Completed").count()
    InProgress = ServiceRequest.query.filter_by(user_id = custObj.user_id, status = "In Progress").count()
    recent_request = serReqs[-1]
    statistics = {
        'current_balance': custObj.balance,
        'total_request_made': total_request_made,
        'recent_request_service': recent_request.service_name,
        "recent_request_status": recent_request.status,
        'ServiceRequestStatus': {"Requested":Requested,"Completed":Completed,"In Progress":InProgress},
        "Last5daysRequestMade" : last_5_days_request_made(serReqs=serReqs)
    }

    return jsonify(statistics)

def plot_bar_service_Request_count(serReqs):

    req_number,inProg_number,completed_number = 0,0,0

    for i in serReqs:
        if i.status == 'Requested':
            req_number += 1
        if i.status == 'In Progress':
            inProg_number += 1
        if i.status == 'Completed':
            completed_number += 1


    categories = ['Requested', 'In Progress', 'Completed']
    values = [req_number, inProg_number, completed_number]
    colors = ['blue', 'green', 'red']

    plt.figure(figsize=(10, 6))
    plt.bar(categories, values)
    plt.xlabel("Counnt")
    plt.ylabel("Status")
    plt.title('Service Requests')
    plt.tight_layout()
    plt.savefig('./static/uploads/bar_service_Request_count.png')
    plt.close()

    return '/static/uploads/bar_service_Request_count.png'
def last_5_days_request_made(serReqs):
    """
    Filters and counts the number of service requests made in the last 5 days.

    Args:
    serReqs (list): A list of service request objects, where each object has a `request_date` attribute.

    Returns:
    dict: A dictionary with dates as keys (last 5 days) and the count of requests on those days.
    """
    # Get the current date
    today = datetime.now().date()
    
    # Determine the date 5 days ago
    last_5_days = [(today - timedelta(days=i)) for i in range(5)]

    # Convert dates into strings for consistency
    last_5_days_str = [str(date) for date in last_5_days]

    # Extract request dates from the service request objects
    request_dates = [str(req.request_date.date()) for req in serReqs]

    # Count the occurrences of each date in request_dates
    request_counts = Counter(request_dates)

    # Filter only the dates in the last 5 days and their counts
    last_5_days_counts = {date: request_counts.get(date, 0) for date in last_5_days_str}

    return last_5_days_counts
def get_average_remarks(serReqs):
    count = 0
    total = 0.0
    for serReq in serReqs:
        total += serReq.remarks
        count += 1
    return float(total/count)

def get_service_time_distribution(household_services=Service.query.all()):
    """
    Returns service time distribution categorized into bins for visualization.
    """
    # Define the time bins and the corresponding labels
    bins = [0, 1, 2, 3, 4, 5, 6]  # Define bin edges (for example: 0-1 hours, 1-2 hours, etc.)
    bin_labels = ['0-1 hours', '1-2 hours', '2-3 hours', '3-4 hours', '4-5 hours', '5+ hours']
    
    # Get the time_required values
    times = [service.time_required for service in household_services]

    # Use numpy's digitize to categorize each time value into bins
    categorized_times = np.digitize(times, bins)
    
    # Count how many services fall into each bin
    time_distribution = [categorized_times.tolist().count(i) for i in range(1, len(bins))]

    return {"time_bins": bin_labels, "time_distribution": time_distribution}

@app.route('/api/Professional_statistics', methods=['GET'])
@auth_required("token")
def Professional_statistics():
    prof_email = request.args.get('email')
    profObj_user = User.query.filter_by(email = prof_email).first()
    profObj = profObj_user.professional
    total_tasks_completed = ServiceRequest.query.filter_by(professional_id = profObj.professional_id,status = "Completed").count()
    total_tasks_inprogress = ServiceRequest.query.filter_by(professional_id = profObj.professional_id,status = "In Progress").count()
    total_tasks_requested = ServiceRequest.query.filter_by(professional_id = profObj.professional_id,status = "Requested").count()
    serReqs = ServiceRequest.query.all()
    statistics = {
        'total_revenue': profObj.revenue,
        "average_remarks": get_average_remarks(ServiceRequest.query.filter_by(professional_id = profObj.professional_id).all()),
        "average_ratings": profObj.rating,
        "tasks_stats" : {
        'Total Tasks Completed': total_tasks_completed,
        'Total Tasks In Progress': total_tasks_inprogress,
        'Total Tasks Requested': total_tasks_requested
        },
        "Last5daysContribution" : last_5_days_completed_requests(serReqs)
    }
    return jsonify(statistics)

def last_5_days_completed_requests(serReqs):
    """
    Filters and counts the number of completed service requests made in the last 5 days.

    Args:
    serReqs (list): A list of service request objects, where each object has `request_date` and `status` attributes.

    Returns:
    dict: A dictionary with dates as keys (last 5 days) and the count of completed requests on those days.
    """
    # Get the current date
    today = datetime.now().date()

    # Determine the date range for the last 5 days
    last_5_days = [(today - timedelta(days=i)) for i in range(5)]

    # Convert dates into strings for consistency
    last_5_days_str = [str(date) for date in last_5_days]

    # Filter requests for the last 5 days with status 'completed'
    completed_requests = [
        str(req.request_date.date()) 
        for req in serReqs 
        if str(req.request_date.date()) in last_5_days_str and req.status.lower() == 'completed'
    ]

    # Count the occurrences of completed requests per date
    request_counts = Counter(completed_requests)

    # Create a dictionary for the last 5 days with their counts (default to 0 if no data)
    last_5_days_counts = {date: request_counts.get(date, 0) for date in last_5_days_str}

    return last_5_days_counts

def plot_bar_chart(serReqs):
    
    recieve_number,closed_number,rejected_number = 0,0,0

    for i in serReqs:
        if i.status == 'Requested':
            recieve_number += 1
        if i.status == 'Completed':
            closed_number += 1
        if i.status == 'Rejected':
            rejected_number += 1


    categories = ['Requested', 'Completed' , 'Rejected']
    values = [recieve_number, closed_number, rejected_number]
    colors = ['red', 'green', 'blue']

    plt.figure(figsize=(10, 6))
    plt.bar(categories, values)
    plt.xlabel("Count")
    plt.ylabel("Status")
    plt.title('Service Requests')
    plt.tight_layout()
    plt.savefig('./static/uploads/bar_count.png')
    plt.close()

    return '/static/uploads/bar_count.png'

###########################################################################################################################################################
#####################################################################       SERVICES       ################################################################

@app.route('/api/postServices',methods=['POST'])
def postServices():
    service_name = request.form.get('service_name')
    description = request.form.get('description')
    base_price = request.form.get('base_price')
    time_required = request.form.get('time_required')
    if not service_name or not base_price or not description or not time_required:
        return jsonify({'success': False, 'message': 'All Fields are required.'}), 400

    new_service = Service(
        service_name=service_name,
        description=description,
        base_price=base_price,
        time_required=time_required
    )
    db.session.add(new_service)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Service added successfully'})

@app.route('/api/getServices',methods=['GET'])
def getServices():
    services = Service.query.all()
    return jsonify([{
        'service_id' : p.service_id,
        'service_name' : p.service_name,
        'description' : p.description,
        'base_price' : p.base_price,
        'time_required' : p.time_required,
        'review' : json.loads(p.review) if p.review not in [None, "null"] else [],
    } for p in services ])

@app.route('/api/delService',methods=['POST'])
def delService():
    id = request.form.get('id')
    service = Service.query.filter_by(service_id=id).first()
    if not service :
        return jsonify({'success':False,'message':'Some Error in Deleting!'})
    db.session.delete(service)
    db.session.commit()
    return jsonify({'success':True,'message':'Service Deleted Successfully!'})

@app.route('/api/edit_service', methods=["POST"])
def edit_service():
    service_id = request.form.get('service_id')
    service_name = request.form.get('service_name')
    description = request.form.get('description')
    base_price = request.form.get('base_price')
    time_required = request.form.get('time_required')
    
    if not service_name or not description or not base_price or not time_required :
        return jsonify({'success': False,'message':'All Fields are required!'}), 400
    
    theatre_detail = Service.query.filter_by(service_id=service_id).first()

    if not theatre_detail :
        return jsonify({'success': False,'message':'Something Went Wrong!'})

    theatre_detail.service_id = service_id
    theatre_detail.service_name = service_name
    theatre_detail.description = description
    theatre_detail.base_price = base_price
    theatre_detail.time_required = time_required
    
    db.session.commit()
    
    return jsonify({'success': True,'message':'Service Edited!'})

@app.route('/api/searchService', methods=['GET'])
def search_service():
    service_name = request.args.get('serviceName', '')
    time_required = request.args.get('timeRequired', '')

    query = Service.query
    if service_name:
        query = query.filter(Service.service_name.ilike(f"%{service_name}%"))
    if time_required:
        query = query.filter(Service.time_required == time_required)

    services = query.all()
    result = [{
        'service_id' : service.service_id,
        'service_name' : service.service_name,
        'description' : service.description,
        'base_price' : service.base_price,
        'time_required' : service.time_required,
        'review' : json.loads(service.review) if service.review not in [None, "null"] else [],
    } for service in services]
    
    return jsonify(result)

@app.route('/api/searchServiceReq',methods=["GET"])
def search_ServiceReq_Professional():
    selectedServiceReq = request.args.get('selectedServiceReq','')
    remarks = request.args.get('remarks','')
    status = request.args.get('status','')
    print('His')
    query = ServiceRequest.query
    if selectedServiceReq:
        query = query.filter(ServiceRequest.request_id.ilike(f"%{selectedServiceReq}%"))
    if status:
        query = query.filter(ServiceRequest.status.ilike(f"%{status}%"))
    if remarks:
        query = query.filter(ServiceRequest.remarks == remarks)

    servicesRequests = query.all()
    result = [serviceReq.to_dict() for serviceReq in servicesRequests]

    return jsonify(result)

@app.route('/api/searchProfessional',methods=["GET"])
def searchProfessional():
    professionalName = request.args.get('professionalDetail','')
    print(professionalName)
    query = Professional.query
    if professionalName: 
        query = query.filter(Professional.fullname.ilike(f"%{professionalName}%"))
    searchedProfessionals = query.all()

    result = [{
        'professional_id' : professsional.professional_id,
        'email' : professsional.email,
        'password' : professsional.password,
        'service_type':professsional.service_type,
        'Experience':professsional.Experience,
        'fullname' : professsional.fullname,
        'phone' : professsional.phone,
        'address' : professsional.address,
        'profile_picture' : professsional.profile_picture,
        'pin_code' : professsional.pin_code,
        'rating' : professsional.rating,
        'approved' : professsional.approved,
        'notification' : professsional.notification,
        'blocked' : professsional.blocked
    } for professsional in searchedProfessionals]

    return jsonify(result)

@app.route('/api/giveReview',methods=["GET","POST"])
def giveReviews():
    userEmail = request.args.get('userEmail')
    service = request.args.get('service')
    review = []
    serviceOBJ = Service.query.filter_by(service_id = service).first()
    custOBJ = User.query.filter_by(email=userEmail).first()
    if serviceOBJ.review != '':
        review = json.loads(serviceOBJ.review)
    review.append({'user_id':custOBJ.user_id,'review':''})
    return jsonify({
        'success':True,
        'message':'Reviews Added!!!'
    })

#####################################################################################################################################################
#################################################################       userS       #############################################################

@app.route('/api/getusers',methods=['GET','POST'])
def getusers():
    user_email = request.args.get('email')
    if user_email:
        
        user = User.query.filter_by(email=user_email).first()
        return jsonify({
            'user_id' : user.user_id,
            'email' : user.email,
            'password' : user.password,
            'fullname' : user.fullname,
            "balance": user.balance,
            'phone' : user.phone,
            'address' : user.address,
            'notification' : user.notification,
            'pin_code' : user.pin_code,
            'blocked' : user.blocked
        })
    users = Role.query.filter_by(name ="user").first()
    users = users.users
    return jsonify([p.to_dict() for p in users ])

@app.route('/api/blockuser',methods=["POST"])
@auth_required('token')
@roles_required("admin")
def blockuser():
    data = request.json
    cust_id = data.get('id')
    user = User.query.get(cust_id)
    user.blocked = 1
    db.session.commit()

    return jsonify({
        'success' : True,
        'message' : "Blocked!"
    })

@app.route('/api/unBlockuser',methods=["POST"])
@auth_required('token')
@roles_required("admin")
def unBlockuser():
    data = request.json
    cust_id = data.get('id')
    user = User.query.get(cust_id)
    user.blocked = 0
    db.session.commit()
    return jsonify({
        'success' : True,
        'message' : "UnBlocked!"
    })

@app.route('/api/postCustomers',methods=["POST"])
def postusers():
    fullname = request.form.get('fullname')
    email = request.form.get('email')
    password = request.form.get('password')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pin_code = request.form.get('pincode')
    if not fullname or not email or not password or not phone or not address or not pin_code:
        return jsonify({'success':False,'message':"All Fields are Required!"})
    
    new_user = User(fullname = fullname,
                                    email=email,
                                    password=hash_password(password),
                                    phone = phone,
                                    address = address,
                                    pin_code = pin_code,
                                    fs_uniquifier = str(uuid.uuid4())
                                    )
    cutomer_role = datastore.find_role("user")
    datastore.add_role_to_user(new_user,cutomer_role)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        'success':True,
        'message':'Please check you email!'
    })

@app.route('/api/edit_profile_user',methods=['POST'])
def Edit_profile_user():
    fullname = request.form.get('fullname')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pincode = request.form.get('pincode')
    user_email = request.args.get('email')
    edit_user = User.query.filter_by(email=user_email).first()

    edit_user.fullname = fullname
    edit_user.phone = phone
    edit_user.address = address
    edit_user.pin_code = pincode

    db.session.commit()

    return jsonify({
        'success':True,
        'message':'Profile Edited Successfully!!'
    })

#####################################################################################################################################################
###############################################################       PROFESSIONALS       ###########################################################

@app.route('/api/getProfessionals',methods=['GET','POST'])
def getProfessionals():
    professional_email = request.args.get('email')
    if professional_email:
        professional_userObj = User.query.filter_by(email=professional_email).first()
        professional = professional_userObj.professional
        return jsonify(professional.to_dict())
    professionals = Professional.query.all()
    return jsonify([p.to_dict() for p in professionals ])

@app.route('/api/delProfessionals',methods=['POST'])
@auth_required('token')
@roles_required("admin")
def delProfessionals():
    id = request.json.get('id')
    professional = Professional.query.filter_by(professional_id=id).first()
    user_id = professional.cid
    user = User.query.get(user_id)
    role_user = RolesUsers.query.filter_by(user_id = user_id).first()
    service_reqs = ServiceRequest.query.filter_by(professional_id = id).all()
    print(service_reqs)
    if not professional :
        return jsonify({'success':False,'message':'Some Error in Deleting!'})
    for i in service_reqs:
        db.session.delete(i)
    db.session.delete(professional)
    db.session.delete(role_user)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success':True,'message':'Professional Deleted Successfully!'})

@app.route('/api/approveProfessional',methods=["POST"])
@auth_required('token')
@roles_required("admin")
def approveProfessional():
    prof_id = request.json.get("id")
    professional = Professional.query.get(prof_id)
    professional.approved = 1
    db.session.commit()
    return jsonify({
        'success' : True,
        'message' : "Approved!"
    })

@app.route('/api/blockProfessional',methods=["POST"])
@auth_required('token')
@roles_required("admin")
def blockProfessional():
    data = request.json
    prof_id = data.get("id")
    professional = Professional.query.get(prof_id)
    professional.blocked = 1
    db.session.commit()

    return jsonify({
        'success' : True,
        'message' : "Blocked!"
    })

@app.route('/api/unBlockProfessional',methods=["POST"])
@auth_required('token')
@roles_required("admin")
def unBlockProfessional():
    data = request.json
    prof_id = data.get("id")
    professional = Professional.query.get(prof_id)
    professional.blocked = 0
    db.session.commit()

    return jsonify({
        'success' : True,
        'message' : "UnBlocked!"
    })

@app.route('/api/postProfessionals',methods=["POST"])
def postProfessionals():
    fullname = request.form.get('fullname')
    email = request.form.get('email')
    password = request.form.get('password')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pin_code = request.form.get('pincode')
    profile_picture = request.files['profile_picture']
    print(profile_picture)
    if profile_picture and allowed_file(profile_picture.filename):
        filename = secure_filename(profile_picture.filename)
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        profile_picture.save(file_path)

    if not fullname or not email or not password or not phone or not address or not pin_code or not profile_picture :
        return jsonify({'success':False,'message':"All Fields are Required!"})
    professional_role = datastore.find_role("professional")
    new_cust = User(
                        fullname = fullname,
                        email=email,
                        password=hash_password(password),   
                        phone = phone,
                        address = address,
                        pin_code = pin_code,
                        fs_uniquifier = str(uuid.uuid4())                                                     
                    )
    datastore.add_role_to_user(new_cust,professional_role)
    db.session.commit()
    new_professional = Professional(profile_picture=file_path,cid = new_cust.user_id)
    db.session.add(new_professional)
    db.session.commit()

    return jsonify({
        'success':True,
        'message':'Please check you email!'
    })

@app.route('/api/edit_profile_professional',methods=['POST'])
def Edit_profile_professional():
    fullname = request.form.get('fullname')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pincode = request.form.get('pincode')
    profile_picture = request.form.get('profile_picture')

    professional_email = request.args.get('email')
    edit_professional_user = User.query.filter_by(email=professional_email).first()
    edit_professional_user.user.fullname = fullname
    edit_professional_user.user.phone = phone
    edit_professional_user.user.address = address
    edit_professional_user.user.pin_code = pincode
    edit_professional = edit_professional_user.professional
    edit_professional.profile_picture = profile_picture

    db.session.commit()

    return jsonify({
        'success':True,
        'message':'All is good!'
    })

@app.route('/api/assignedProfessional', methods=["GET"])
def getAssignedProfessionals():
    service_name = request.args.get('serviceName')
    professional_list = []
    professionals = Professional.query.filter_by(service_type = service_name).all()
    professional_list =[p.to_dict() for p in professionals]
    return jsonify(professional_list),200  # Directly return the list of dictionaries

######################################################################################################################################################
###############################################################       SERVICEREQUEST       ###########################################################

@app.route('/api/getServiceRequest',methods=['GET'])
def getServiceRequest():
    cust_email = request.args.get('email')
    profEmail = request.args.get('profEmail')
    if cust_email:
        cust_detail = User.query.filter_by(email=cust_email).first()
    if profEmail:
        prof_detail_user = User.query.filter_by(email=profEmail).first()
        prof_detail = prof_detail_user.professional
    serviceRequests = ServiceRequest.query.all()
    serviceRequestList=[]
    if cust_email:
        for i in serviceRequests:
            if i.user_id == cust_detail.user_id :
                serviceRequestList.append(i.to_dict())
        return jsonify(serviceRequestList)
    elif profEmail:
        name = request.args.get('name')
        if name == 'past':
            for i in serviceRequests:
                if i.professional_id == prof_detail.professional_id and i.status == 'Completed':
                    serviceRequestList.append(i.to_dict())
            return jsonify(serviceRequestList)
        else:
            for i in serviceRequests:
                if i.professional_id == prof_detail.professional_id and i.status!='Completed':
                    serviceRequestList.append(i.to_dict())
            return jsonify(serviceRequestList)
    return jsonify([p.to_dict() for p in serviceRequests ])

@app.route('/api/serviceRequest',methods=["POST"])
@auth_required('token')
def PostServiceRequest():
    choosedProfessional = request.form.get('choosedProfessional')
    userEmail = request.form.get('CustomerEmail')
    service_name = request.form.get('service_name')
    professionalObj_user = User.query.filter_by(fullname=choosedProfessional).first()
    professionalObj = professionalObj_user.professional
    userObj = datastore.find_user(email=userEmail)
    serviceObj = Service.query.filter_by(service_name=service_name).first()
    new_serviceRequest = ServiceRequest(service_id=serviceObj.service_id,
                                        service_name=serviceObj.service_name,
                                        professional_id=professionalObj.professional_id,
                                        professional_name=professionalObj_user.fullname,
                                        user_id=userObj.user_id,
                                        user_name=userObj.fullname,
                                        status='Requested',
                                        request_date=datetime.utcnow()
                                        )
    db.session.add(new_serviceRequest)
    db.session.commit()

    return jsonify({
        'success':True,
        'message':'Your Request Has Been Submitted!!!'
    })

@app.route('/api/completedServiceRequest',methods=["POST"])
@auth_required('token')
def completedServiceRequest():
    request_id = request.json.get('requestID')
    servREQ = ServiceRequest.query.filter_by(request_id=request_id).first()
    service = Service.query.get(servREQ.service_id)
    cust = servREQ.user
    profes = servREQ.professional
    cust.balance -= service.base_price
    profes.revenue += service.base_price
    servREQ.status = "Completed"
    servREQ.completion_date = datetime.utcnow()
    db.session.commit()
    return jsonify({
        'success':True,
        'message':'Notification Sent to user.'
    })

@app.route('/api/closeServiceRequest',methods=['POST','GET'])
@auth_required('token')
def closeServiceRequest():
    servReqId=request.json.get('servReqId')
    profRating=request.json.get('profRating')
    servReqRating=request.json.get('servReqRating')
    servReqObj = ServiceRequest.query.filter_by(request_id=servReqId).first()
    ProfObj = Professional.query.filter_by(professional_id=servReqObj.professional_id).first()
    servObj = Service.query.filter_by(service_id=servReqObj.service_id).first()
    prevReview = int(ProfObj.rating)
    updatedReview = (prevReview + int(profRating)) // 2
    ProfObj.rating = updatedReview
    servReqObj.remarks = servReqRating
    servReqObj.closed = 1
    if not servReqObj.completion_date:
        servReqObj.completion_date = datetime.utcnow()
    db.session.commit()
    return jsonify({
        'success':True,
        'message':'Service Request Successfully Closed!!!'
    })

@app.route('/api/editServiceRequest',methods=["POST"])
def editServiceRequest():
    status = request.form.get('status')
    remarks = request.form.get('remarks')
    request_id = request.form.get('request_id')
    serviceReqObj = ServiceRequest.query.filter_by(request_id=request_id).first()
    serviceReqObj.status = status
    serviceReqObj.remarks = remarks
    db.session.commit()

    return jsonify({
        'success':True,
        'message':'Service Request Edited!!'
    })

#####################################################################################################################################################
##################################################################       REVIEWS       ##############################################################


@app.route('/api/getReviews',methods=['GET'])
def getReviews():
    services = Service.query.all()
    service_id = request.args.get('service')
    service_nid = Service.query.get(service_id) if service_id else None
    if service_id and service_nid:
        reviews = json.loads(service_nid.review) if service_nid.review not in [None, "null"] else []
        if reviews == []:
            return jsonify({
                'success':False
            })
        return jsonify([{
            'user_id' : p['user_id'],
            'user_name' : p['user_name'],
            'service_id' : p['service_id'],
            'service_name' : p['service_name'],
            'review' : p['review']
        }for p in reviews])
    reviews_list=[]
    for i in services:
        alist = json.loads(i.review) if i.review not in [None, "null"] else []
        reviews_list.append(alist)
    return jsonify([{
            'user_id' : p[0]['user_id'],
            'user_name' : p[0]['user_name'],
            'service_id' : p[0]['service_id'],
            'service_name' : p[0]['service_name'],
            'review' : p[0]['review']
        }for p in reviews_list if p != []])

@app.route('/api/postReview',methods=["POST"])
@auth_required('token')
def postReviews():
    userEmail = request.json.get('userEmail')
    serviceId = request.json.get('serviceId')
    review_text = request.json.get('review')
    cust = User.query.filter_by(email=userEmail).first()
    service = Service.query.filter_by(service_id=serviceId).first()
    review = json.loads(service.review) if service.review not in [None, "null"] else []
    review.append({
        'user_id': cust.user_id,
        'user_name': cust.fullname,
        'service_id': service.service_id,
        'service_name': service.service_name,
        'review': review_text
    })
    service.review = json.dumps(review)
    db.session.commit()
    return jsonify({'success':True,'message':'Review is successfully added.'})

@app.route('/api/editReviews',methods=["POST"])
@auth_required('token')
def editReviews():
    userEmail = request.json.get('userEmail')
    serviceId = request.json.get('serviceId')
    new_review_text = request.json.get('NEWreview')
    old_review_text = request.json.get('OLDreview')
    cust = User.query.filter_by(email=userEmail).first()
    service = Service.query.filter_by(service_id=serviceId).first()
    review = json.loads(service.review) if service.review not in [None, "null"] else []
    print(review)
    for i in review:
        if i['user_id'] == cust.user_id and i['user_name'] == cust.fullname and i['service_id'] == service.service_id and i['service_name'] == service.service_name and i['review'] == old_review_text :
            i['review'] = new_review_text
    service.review = json.dumps(review)
    db.session.commit()
    return jsonify({
        'success':True
    })

@app.route('/api/deleteReviews',methods=["POST"])
@auth_required('token')
def deleteReviews():
    review = request.json.get('review')
    service_id = request.json.get('service_id')
    user_id = request.json.get('user_id')
    print(service_id,review,user_id)
    service = Service.query.filter_by(service_id=service_id).first()
    searched_service = json.loads(service.review) if service.review not in [None, "null"] else []
    for i in searched_service:
        if(i['user_id']==int(user_id) and i['review']==review):
            a=i
    searched_service.remove(a)
    service.review = json.dumps(searched_service)
    db.session.commit()
    return jsonify({
        'success':True,
        'message':'Review (('+a['review']+')) Successfully Deleted!!'
    })

#####################################################################################################################################################
#############################################################       Notification THINGS       #######################################################

@app.route('/api/send_notification', methods=["POST"])
@auth_required('token')
def send_notification():
    data = request.json
    service = request.args.get('service')
    email = data.get('email')
    profes_use = datastore.find_user(email = email)
    if profes_use:
        profes = profes_use.professional
    user_email = request.json.get('userEmail')
    professional_email = request.args.get('Professional_email')
    name = request.json.get('name')
    request_id = request.json.get('request_id')

    notification = []

    if name == 'Completed':
        return handle_completed_notification(request_id)

    if user_email:
        return handle_user_to_professional_notification(user_email, request)

    if professional_email:
        return handle_professional_to_user_notification(professional_email, name, request)

    return handle_admin_to_professional_notification(profes,profes_use, service)

def handle_completed_notification(request_id):
    """Handle notification for completed service requests."""
    servoReq = ServiceRequest.query.filter_by(request_id=request_id).first()
    custOBJ = User.query.filter_by(user_id=servoReq.user_id).first()
    notification = json.loads(custOBJ.notification) if custOBJ.notification else []
    
    notification.append({
        "sender": f"{servoReq.professional_name} (Professional)",
        "message": f"{servoReq.service_name} is completed! Please close it."
    })
    
    custOBJ.notification = json.dumps(notification)
    db.session.commit()
    return jsonify({'success': True})

def handle_professional_to_user_notification(professional_email, name, request):
    """Handle notification from professional to user."""
    servName = request.args.get('servName')
    service_name = servName.split(' ')[2]
    servObj = Service.query.filter_by(service_name=service_name).first()
    user_name = request.args.get('sentBy').split(' ')[0]
    userObj = User.query.filter_by(fullname=user_name).first()
    professionalObj = User.query.filter_by(email=professional_email).first()
    
    notification = []
    if name == 'Accept':
        notification.append({
            "sender": f"{professionalObj.fullname} (Professional)",
            "message": f"{professionalObj.fullname} accepted {servObj.service_name}"
        })
    elif name == 'Reject':
        notification.append({
            "sender": f"{professionalObj.fullname} (Professional)",
            "message": f"{professionalObj.fullname} rejected {servObj.service_name}"
        })
    
    userObj.notification = json.dumps(notification)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Notification is sent to user'
    })

def handle_user_to_professional_notification(user_email, request):
    """Handle notification from user to professional."""
    user_obj = User.query.filter_by(email=user_email).first()
    choosedProfessional = request.json.get('choosedProfessional')
    service_name = request.json.get('service_name')
    print(choosedProfessional)
    notification = [{
        "sender": f"{user_obj.fullname} (user)",
        "message": f'Do this {service_name} before completion date.'
    }]
    
    User_OBJ_Notification = User.query.filter_by(fullname=choosedProfessional).first()
    User_OBJ_Notification.notification = json.dumps(notification)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Notification is sent to Professional'
    })

def handle_admin_to_professional_notification(profes,profes_use, service):
    """Handle notification from admin to professional."""
    notification = [{
        "sender": 'admin',
        "message": f'Do you want to do {service}'
    }]
    
    profes_use.notification = json.dumps(notification)
    print(profes_use.notification)
    profes.service_type = service
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Notification is sent!!!'
    })

@app.route('/api/ServiceNotification', methods=["POST"])
@auth_required('token')
def ServiceNotification():
    name = request.json.get('name')
    service_text = request.json.get('service_text')
    sentBy = request.json.get('sentBy')
    sender = request.json.get('sender')
    serviceReq = request.json.get('serviceReq')

    professionalObject_user = User.query.filter_by(email=sender).first()
    professionalObject = professionalObject_user.professional
    if name in ['Accept', 'Reject']:
        if serviceReq == 'ServiceRequest':
            service_name, user_name = extract_service_and_user(service_text, sentBy)
            userObj = User.query.filter_by(fullname=user_name).first()
            serviceObj = Service.query.filter_by(service_name=service_name).first()
            update_notifications( sentBy, service_text,professionalObject_user)
            update_service_request_status(serviceObj, professionalObject, userObj, name)

            return jsonify({
                'success': True,
                'message': 'All is good!'
            })

        update_notifications(sentBy, service_text,professionalObject_user)

        if name == 'Reject':
            professionalObject.service_type = None
            db.session.commit()

        db.session.commit()

    return jsonify({
        'success': True,
        'message': 'All is good!'
    })

def extract_service_and_user(service_text, sentBy):
    """Extract service name and user name from the request."""
    service_list = service_text.split(' ')
    service_name = service_list[2]  # Assuming service name is at index 2
    user_list = sentBy.split(' ')
    user_name = user_list[0]  # Assuming user name is at index 0
    return service_name, user_name

def update_notifications(sentBy, service_text,userObj):
    """Update the notifications of the professional by removing the specific notification."""
    notifications = json.loads(userObj.notification)
    notifications = [i for i in notifications if not (i['sender'] == sentBy and i['message'] == service_text)]
    userObj.notification = json.dumps(notifications)

def update_service_request_status(serviceObj, professionalObject, userObj, action):
    """Update the status of the service request based on the action (Accept/Reject)."""
    servReq = ServiceRequest.query.filter_by(
        service_id=serviceObj.service_id,
        professional_id=professionalObject.professional_id,
        user_id=userObj.user_id,
        closed = 0
    ).first()

    if action == 'Accept':
        servReq.status = "In Progress"
    elif action == 'Reject':
        servReq.status = "Rejected"

    db.session.commit()

@app.route('/api/getNotifications', methods=['GET',"POST"])
@auth_required("token")
def getNotifications():
    email = request.args.get('email')
    name = request.args.get('name')
    user = datastore.find_user(email = email)
    if user.has_role("professional"):
        profes = Professional.query.filter_by(cid = user.user_id)
        if profes and user.notification!=None:
            notifications = json.loads(user.notification)
    elif user.has_role("user"):
        if user and user.notification!=None:
            notifications = json.loads(user.notification)
    elif user.has_role("admin"):
        if user and user.notification!=None:
            notifications = json.loads(user.notification)
    if notifications is None:
        return jsonify({
            'sender' : '',
            'message' : ''
        })

    return jsonify([{
        'sender' : p.get('sender', 'Unknown'),
        'message' : p.get('message', ''),
    } for p in notifications])

@app.route('/api/deleteNotification',methods=["GET","POST"])
@auth_required("token")
def deltedNotificaitons():
    user_email = request.json.get('user_email')
    user_detail = User.query.filter_by(email=user_email).first()
    notifications = json.loads(user_detail.notification)
    notificationSender = request.json.get('notificationSender')
    notificationMessage = request.json.get('notificationMessage')
    updated_notifications = []
    for i in notifications:
        if not (i['sender'] == notificationSender and i['message'] == notificationMessage):
            updated_notifications.append(i)
    user_detail.notification = json.dumps(updated_notifications)
    db.session.commit()
    return jsonify({
        'success':True,
        'message':'Successfully Deleted Notification!!!'
    })


@app.route("/api/authenticate",methods = ["GET","POST"])
def login_func():
    credentials = request.get_json()
    user = datastore.find_user(email = credentials.get("email"))
    if user and verify_password(credentials.get("password"),user.password):
        login_user(user)
        if user.has_role("admin"):
            return jsonify({"role": "admin","token": user.get_auth_token(), "user_id": user.user_id}),200
        elif user.has_role("professional") and user.professional.approved and user.professional.blocked==0:
            return jsonify({"role": "professional","token": user.get_auth_token(), "user_id": user.user_id}),200
        elif user.has_role("user"):
            return jsonify({"role": "user","token": user.get_auth_token(), "user_id": user.user_id}),200
    return jsonify({"message": "Invalid Credentials"}),404


@app.route("/api/logout")
def l():
    logout_user()
    return jsonify({"message" : "Successfully Logged out!!","success": True}),200

