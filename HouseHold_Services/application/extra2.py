
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
    re = reviews_list[0]
    print(re[0]['user_id'])
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
