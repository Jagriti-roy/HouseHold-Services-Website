const store = new Vuex.Store({
    state: {
        title: 'House-Hold-Services',
        condition: 0,
        ltoken: 1, 
        stoken: 1, 
        SLToken:1,
        maintoken: 0, 
        main_app_condition: localStorage.getItem('some_random_key') ? Number(localStorage.getItem('some_random_key')) : 0,
        service_info: [],
    },
    mutations: {
        setLToken(state, value) {
            state.ltoken = value;
        },
        setSToken(state, value) {
            state.stoken = value;
        },
        setcondition(state,value) {
            state.condition = value;
        },
        set_main_app_condition(state,{value1,value2}) {
            state.main_app_condition = value1;
            localStorage.setItem('some_random_key',value1);
        },
        setServiceInfo(state,value) {
            state.service_info = value;
        },
    }
});

// ------------------------------------------------------------ ADMIN -------------------------------------------------------- //

const AdminDashboard = {
    template: `
        <div v-if="this.$store.state.condition === 0">
            <nav class="bg-dark bg-gradient p-3">
                <ul class="nav">
                    <li class="nav-item me-4">
                        <span class="text-white font-weight-bold h2">{{title}}</span>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/customers">Customers</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/professionals">Professionals</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/services">Services</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/service_request">Service_request</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-light" to="/admin/reviews">Reviews</router-link>
                    </li>
                    <button class="btn btn-outline-light text-black" @click="logout">
                    Log-out
                    </button>
                </ul>
            </nav>
            <div class="container mt-4">
                <router-view></router-view>
            </div>
        </div>

        
        <!-- -----------------------------------------------------------ADD Services parts------------------------------------------------------ -->
        <div v-else-if="this.$store.state.condition === 2" class="mt-5">
            <div class="container mt-4">
                <div class="bg-dark text-white p-3 rounded shadow">
                    <button @click="setcondition(0)" class="btn btn-warning mb-3">Go back</button>
                    <div class="bg-secondary text-white rounded p-2 mb-3">
                        <p class="h4">Service Details</p>
                    </div>
                    <form @submit.prevent="addService" method="post" class="row g-3" enctype="multipart/form-data">
                        <div class="col-md-6">
                            <label class="form-label text-light">Service Name</label>
                            <input v-model="service.service_name" class="form-control" type="text" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Desription</label>
                            <input v-model="service.description" class="form-control" type="text" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Price</label>
                            <input v-model="service.base_price" class="form-control" type="number" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Time Required</label>
                            <input v-model="service.time_required" class="form-control" type="number" required>
                        </div>
                        <div class="col-md-12">
                            <button class="btn btn-success w-100" type="submit">Add Service</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        
        
        <!-- -----------------------------------------------------------EDIT Services parts------------------------------------------------------ -->
        <div v-else-if="this.$store.state.condition === 5" class="mt-5">
            <div class="container mt-4">
                <div class="bg-dark text-white p-3 rounded shadow">
                    <button @click="setcondition(0)" class="btn btn-warning mb-3">Go back</button>
                    <div class="bg-secondary text-white rounded p-2 mb-3">
                        <p class="h4">Edit Service</p>
                    </div>
                    <form @submit.prevent="editService" method="post" class="row g-3" enctype="multipart/form-data">
                        <div class="col-md-6">
                            <label class="form-label text-light">Service Name</label>
                            <input v-model="editServiceInfo.service_name" class="form-control" type="text" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Description</label>
                            <input v-model="editServiceInfo.description" class="form-control" type="text" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Price</label>
                            <input v-model="editServiceInfo.base_price" class="form-control" type="number" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-light">Time Required</label>
                            <input v-model="editServiceInfo.time_required" class="form-control" type="number" required>
                        </div>
                        <div class="col-md-12">
                            <button class="btn btn-warning w-100" type="submit">Edit Service</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    `,
    data() {
        return {
            title:'House-Hold-Services',
            service: {
                service_id : 0,
                service_name : '',
                description : '',
                base_price : 100,
                time_required : 60,
            },
            editServiceInfo: [],
            Serv:[],
        }
    },
    mounted() {
        fetch('/api/getServices')
        .then(response => response.json())
        .then(data =>{
            this.Serv = data;
        })
    },
    updated() {
        this.editServiceInfo = this.$store.state.service_info;
    },
    methods:{
        addService(){
            const formData = new FormData();
            formData.append('service_name',this.service.service_name)
            formData.append('description',this.service.description)
            formData.append('base_price',this.service.base_price)
            formData.append('time_required',this.service.time_required)
            fetch('/api/postServices',{
                method:"POST",
                body:formData
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.service.service_name='';
                    this.service.description='';
                    this.service.base_price=100;
                    this.service.time_required=60;
                    this.$store.commit('setcondition', 0);
                    alert('Succesfull to add Service');
                }else{
                    alert('Failed to add Service');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
        },
        editService(){
            const formData = new FormData();
            formData.append('service_id', this.editServiceInfo.service_id);
            formData.append('service_name', this.editServiceInfo.service_name);
            formData.append('description', this.editServiceInfo.description);
            formData.append('base_price', this.editServiceInfo.base_price);
            formData.append('time_required', this.editServiceInfo.time_required);
            // formData.append('capacity', this.editTheatreInfo.capacity);
            

            fetch('/api/edit_service', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.$store.commit('setcondition', 0);
                    alert(data.message);
                } else {
                    alert('Failed to edit theatre');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        setcondition(value) {
            this.$store.commit('setcondition', value);
        },
        logout() {
            fetch("/api/logout")
                .then((res) => {
                    alert("Logged out successfuly!")
                })
                .then((data) => {
                    this.$router.push("/");
                })
                .catch((err) => {
                    alert("Some error occured during Log-out");
                })
        }
    }
};

const Dashboard = {
    data() {
        return {
            loading: true,
            total_customers: 0,
            total_serv_prof: 0,
            total_services: 0,
            total_serv_req: 0,
            total_reviews: 0,
            average_professional_rating: 0,
            most_rated_professional: '',
            most_popular_service: '',
            user_activity: {},
            service_time: {},
            time_bins: [],
            time_distribution: [],
            times: [],
            prices: [],
            errorMessage: '',
            categories: [],
            counts: []
        };
    },
    style: `
        <style>
            .chart-container {
                position: relative;
                height: 400px;
                width: 100%;
            }
            canvas {
                width: 100% !important;
                height: auto !important;
                max-height: 400px;
            }
        </style>
    `,
    template: 
        `<div class="container py-4">
            <h2 class="display-4 fw-bold text-dark mb-4">Admin Dashboard Stats</h2>
            
            <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 50vh;">
                <img src="/static/uploads/loading.webp" alt="Loading..." class="img-fluid">
            </div>

            <div v-else>
                <div class="row g-4 mb-4">
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Total Customers</h3>
                            <p class="h4 text-muted">{{ total_customers }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Total Service Professionals</h3>
                            <p class="h4 text-muted">{{ total_serv_prof }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Total Services</h3>
                            <p class="h4 text-muted">{{ total_services }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Total Service Request</h3>
                            <p class="h4 text-muted">{{ total_serv_req }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Total Reviews</h3>
                            <p class="h4 text-muted">{{ total_reviews }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Average Prof. Rating</h3>
                            <p class="h4 text-muted">{{ average_professional_rating.toFixed(1) }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Most Rated Professional</h3>
                            <p class="h4 text-muted">{{ most_rated_professional }}</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="bg-white p-4 shadow rounded text-center">
                            <h3 class="h5 fw-semibold text-dark">Most Popular Service</h3>
                            <p class="h4 text-muted">{{ most_popular_service }}</p>
                        </div>
                    </div>
                </div>
                
                <h3 class="h4 fw-bold text-dark mb-4">Charts</h3>
                <div class="mb-4">
                    <div class="chart-container">
                        <canvas ref="serviceTime"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas ref="myPieChart"></canvas>
                    </div>
                </div>
                
                <!-- Optional: Error message -->
                <div v-if="errorMessage" class="text-danger mt-4">{{ errorMessage }}</div>
            
            </div>
        </div>`,
    
    mounted() {
        this.initializeData();
    },
    
    methods: {
        async initializeData() {
            await this.fetchStatistics();
            this.renderCharts();
        },

        async fetchStatistics() {
            try {
                const response = await fetch('/api/admin_statistics', {
                    headers: {
                        "Authentication-Token": localStorage.getItem('token'),
                        "Role": "admin"
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                this.total_customers = data.total_users;
                this.total_serv_prof = data.total_serv_prof;
                this.total_services = data.total_services;
                this.total_serv_req = data.total_serv_req;
                this.total_reviews = data.total_reviews;
                this.average_professional_rating = data.avg_prof_rating;
                this.most_rated_professional = data.max_rated_prof;
                this.most_popular_service = data.most_popular_service;
                this.time_bins = data.time_bins;
                this.time_distribution = data.time_distribution;
                this.service_time = data.service_time;
                this.categories = data.categories;
                this.counts = data.counts;
                this.times = data.price_time.times;
                this.prices = data.price_time.prices;
                
            } catch (error) {
                console.error('Error fetching statistics:', error);
                this.errorMessage = 'There was a problem loading the statistics. Please try again later.';
            } finally {
                this.loading = false;
            }
        },

        renderCharts() {
            if (!this.loading) {
                const ctx1 = this.$refs.serviceTime.getContext("2d");
                new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(this.service_time),
                        datasets: [{
                            label: "Service Counts Of Last Five Days",
                            data: Object.values(this.service_time),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                const ctx2 = this.$refs.myPieChart.getContext('2d');
                new Chart(ctx2, {
                    type: 'pie',
                    data: {
                        labels: this.categories,
                        datasets: [{
                            data: this.counts,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        
                    }
                });

                // const ctx3 = this.$refs.timePieChart.getContext('2d');
                // new Chart(ctx3, {
                //     type: 'pie',
                //     data: {
                //         labels: this.time_bins,
                //         datasets: [{
                //             data: this.time_distribution,
                //             backgroundColor: [
                //                 'rgba(255, 99, 132, 0.6)',
                //                 'rgba(54, 162, 235, 0.6)',
                //                 'rgba(255, 206, 86, 0.6)',
                //                 'rgba(75, 192, 192, 0.6)',
                //                 'rgba(153, 102, 255, 0.6)'
                //             ]
                //         }]
                //     },
                //     options: {
                //         responsive: true,
                //         maintainAspectRatio: false,
                        
                //     }
                // });

                // const ctx4 = this.$refs.priceTimeScatter.getContext('2d');
                // new Chart(ctx4, {
                //     type: 'scatter',
                //     data: {
                //         datasets: [{
                //             label: "Price vs Time Scatter Plot",
                //             data: this.times.map((time, index) => ({
                //                 x: time,
                //                 y: this.prices[index]
                //             })),
                //             backgroundColor: 'rgba(153, 102, 255, 0.8)',
                //             borderColor: 'rgba(153, 102, 255, 1)',
                //             borderWidth: 1
                //         }]
                //     },
                //     options: {
                //         responsive: true,
                //         scales: {
                //             x: {
                //                 type: 'linear',
                //                 position: 'bottom'
                //             }
                //         }
                //     }
                // });
            }
        }
    }
};


const Customers = {
    template: `
        <div>
            <button @click="setcondition(1)" class="btn btn-white mb-2"></button>
            <table class="table table-striped table-hover table-bordered shadow-sm rounded">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Customer ID</th>
                        <th scope="col">Email</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in customers" :key="user.user_id">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openId(user)">
                            {{ user.user_id }}
                        </button>
                        <td>{{ user.email }}</td>
                        <td>{{ user.fullname }}</td>
                        <td>{{ user.phone }}</td>
                        <td>
                            <button v-if="!user.blocked" class="btn btn-danger btn-sm ml-2" @click="blockCustomer(user.user_id,user.fullname)">
                                Block
                            </button>
                            <button v-else="user.blocked" class="btn btn-success btn-sm ml-2" @click="unBlockCustomer(user.user_id,user.fullname)">
                                UnBlock
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- -----------------------------------------------------------Show ID parts------------------------------------------------------ -->
            
            <div v-if="showIdVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">About {{ user.customer_name }}</h5>
                        <p class="text-muted">Customer Details</p>
                    </div>
                    
                    <!-- Customer Details -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-envelope-fill me-2"></i>Email:</h6>
                            <p class="text-dark">{{ user.customer_email }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-telephone-fill me-2"></i>Phone:</h6>
                            <p class="text-dark">{{ user.customer_phone }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-geo-alt-fill me-2"></i>Address:</h6>
                            <p class="text-dark">{{ user.customer_address }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-pin-map-fill me-2"></i>Pincode:</h6>
                            <p class="text-dark">{{ user.customer_pincode }}</p>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>



        </div>

    `,
    data() {
        return {
            customers: [],
            showIdVariable : false,
            user:{
                customer_name:'',
                customer_email:'',
                customer_password:'',
                customer_phone:'',
                customer_address:'',
                customer_pincode:'',
            }
        }
    },
    mounted() {
        fetch('/api/getusers')
        .then(response=>response.json())
        .then(data=>{
            this.customers = data;
        })
    },
    methods: {
        blockCustomer(id,name) {
            const confirmed = window.confirm('Do You want to Block Customer with name: ' + name);
            if(confirmed){
                fetch('/api/blockuser',{
                    method:'post',
                    body: JSON.stringify({ id: id }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                    }
                })
            }
        },
        unBlockCustomer(id,name){
            const confirmed = window.confirm('Do You want to Unblock Customer with name: ' + name);
            if(confirmed){
                fetch('/api/unBlockuser',{
                    method:'post',
                    body: JSON.stringify({ id: id }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                    }
                })
            }
        },
        openId(customerObject){
            this.user.customer_name = customerObject.fullname
            this.user.customer_email = customerObject.email
            this.user.customer_password = customerObject.password
            this.user.customer_phone = customerObject.phone
            this.user.customer_address = customerObject.address
            this.user.customer_pincode = customerObject.pin_code
            this.showIdVariable = true;
        },
        close_box(){
            this.showIdVariable = false;
        }
    }
};

const Professionals = {
    template: `
        <div>
            <div class="d-flex flex-column flex-md-row align-items-center mb-4">
                <input v-model="searchQuery.professionalDetail" @input="searchServiceReq" type="text" 
                        class="form-control rounded-lg ml-3 mb-2 mb-md-0" placeholder="Professional">
            </div>
            <table class="table table-striped table-hover table-bordered shadow-sm rounded">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Professional Id</th>
                        <th scope="col">Email</th>
                        <th scope="col">Fullname</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Profile Docs</th>
                        <th scope="col">Service Type</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody v-if="searchResults.length > 0">
                    <tr v-for="professional in searchResults" :key="professional.professional_id">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openId(professional)">
                            {{ professional.professional_id }}
                        </button>
                        <td>{{ professional.email }}</td>
                        <td>{{ professional.fullname }}</td>
                        <td>{{ professional.phone }}</td>
                        <td>
                            <button @click="viewProfile(professional)" class="btn btn-success btn-sm ml-2">
                                View
                            </button>
                        </td>
                        <td v-if="!professional.service_type">
                            <button @click="assign(professional.professional_id,professional.fullname,professional.email)" class="btn btn-success btn-sm ml-2">
                                Assign
                            </button>
                        </td>
                        <td v-else>
                            {{professional.service_type}}
                        </td>
                        <td v-if="!professional.approved">
                            <button @click="approveProfessional(professional.professional_id,professional.fullname)" class="btn btn-success btn-sm ml-2">
                                Approve
                            </button>
                            <button @click="delete_professional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Delete
                            </button>
                        </td>
                        <td v-else>
                            <button v-if="!professional.blocked" @click="blockProfessional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Block
                            </button>
                            <button v-else="professional.blocked" @click="unBlockProfessional(professional.professional_id,professional.fullname)" class="btn btn-success btn-sm ml-2">
                                UnBlock
                            </button>
                            <button @click="delete_professional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Delete
                            </button>
                        </td>
                        
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr v-for="professional in professionals" :key="professional.professional_id">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openId(professional)">
                            {{ professional.professional_id }}
                        </button>
                        <td>{{ professional.email }}</td>
                        <td>{{ professional.fullname }}</td>
                        <td>{{ professional.phone }}</td>
                        <td>
                            <button @click="viewProfile(professional)" class="btn btn-success btn-sm ml-2">
                                View
                            </button>
                        </td>
                        <td v-if="!professional.service_type">
                            <button @click="assign(professional.professional_id,professional.fullname,professional.email)" class="btn btn-success btn-sm ml-2">
                                Assign
                            </button>
                        </td>
                        <td v-else>
                            {{professional.service_type}}
                        </td>
                        <td v-if="!professional.approved">
                            <button @click="approveProfessional(professional.professional_id,professional.fullname)" class="btn btn-success btn-sm ml-2">
                                Approve
                            </button>
                            <button @click="delete_professional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Delete
                            </button>
                        </td>
                        <td v-else>
                            <button v-if="!professional.blocked" @click="blockProfessional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Block
                            </button>
                            <button v-else="professional.blocked" @click="unBlockProfessional(professional.professional_id,professional.fullname)" class="btn btn-success btn-sm ml-2">
                                UnBlock
                            </button>
                            <button @click="delete_professional(professional.professional_id,professional.fullname)" class="btn btn-danger btn-sm ml-2">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- -----------------------------------------------------------Assign Services parts------------------------------------------------------ -->


            <div v-if="service_assign_variable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <!-- Small Heading for Title -->
                    <h5 class="text-primary mb-3">Assigning Service to {{prof_name}}</h5>
                    
                    <!-- Main Title -->
                    <p>Service Assignment</p>
                    
                    <!-- Service Type Input Box -->
                    <div class="form-group mb-4">
                        <label for="serviceType">Select Service Type</label>
                        <select id="serviceType" v-model="selectedService" class="form-control">
                            <option v-for="service in services" :key="service.service_id" :value="service.service_name">
                                {{ service.service_name }}
                            </option>
                        </select>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="close_assignment" class="btn btn-danger">Close</button>
                        <button @click="assign_service(prof_email)" class="btn btn-success ms-auto">Confirm</button>
                    </div>
                </div>
            </div>

            <!-- -----------------------------------------------------------Show ID parts------------------------------------------------------ -->

            <div v-if="showIdVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">About {{ professional.professional_name }}</h5>
                        <p class="text-muted">Professional Details</p>
                    </div>
                    
                    <!-- Professional Details -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-envelope-fill me-2"></i>Email:</h6>
                            <p class="text-dark">{{ professional.professional_email }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-lock-fill me-2"></i>Password:</h6>
                            <p class="text-dark">{{ professional.professional_password }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-telephone-fill me-2"></i>Phone:</h6>
                            <p class="text-dark">{{ professional.professional_phone }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-geo-alt-fill me-2"></i>Address:</h6>
                            <p class="text-dark">{{ professional.professional_address }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-pin-map-fill me-2"></i>Pincode:</h6>
                            <p class="text-dark">{{ professional.professional_pincode }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-person-fill me-2"></i>Profile Picture:</h6>
                            <p class="text-dark">{{ professional.professional_profilePicture }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-star-fill me-2"></i>Rating:</h6>
                            <p class="text-dark">{{ professional.professional_rating }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-briefcase-fill me-2"></i>Experience:</h6>
                            <p class="text-dark">{{ professional.professional_experience }}</p>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>

            <!-- -----------------------------------------------------------Show VIEW parts------------------------------------------------------ -->

            <div v-if="divViewProfileVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">Profile Docs</h5>
                        <p class="text-muted">Professional Details</p>
                    </div>
                    
                    <!-- Professional Details -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <iframe 
                                v-if="profile_picture_professional" 
                                :src="'/'+profile_picture_professional"
                                width="100%" 
                                height="500px" 
                                style="border: none;">
                            </iframe>
                        </div>
                        
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="closeViewProfile" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>


        </div>

    `,
    data() {
        return {
            professionals: [],
            service_assign_variable:false,
            showIdVariable:false,
            prof_name:'',
            selectedService: '',
            prof_email : '',
            divViewProfileVariable: false,
            profile_picture_professional: null,
            services: [
                // 'Consulting Services',
                // 'Maintenance and Repairs',
                // 'Training and Development',
                // 'Marketing and Promotion',
                // 'Customer Support',
                // 'Financial Planning',
                // 'Product Installation',
                // 'Data Analysis and Reporting',
                // 'IT Support and Networking',
                // 'Graphic Design',
                // 'Content Creation',
                // 'Social Media Management',
                // 'Legal Advice',
                // 'Project Management',
                // 'Software Development',
                // 'Sales Support',
                // 'Event Planning',
                // 'Transportation and Logistics',
                // 'Health and Safety Compliance',
                // 'Quality Assurance and Testing'
            ],
            professional:{
                professional_name:'',
                professional_email:'',
                professional_password:'',
                professional_phone:'',
                professional_address:'',
                professional_pincode:'',
                professional_profilePicture:'',
                professional_experience:'',
                professional_rating:'',
            },
            searchQuery: {
                professionalDetail: ''
            },
            searchResults: [],
            searched: false,
        }
    },
    mounted() {
        fetch('/api/getProfessionals')
        .then(response => response.json())
        .then(data =>{
            this.professionals = data;
        })
        fetch('/api/getServices')
        .then(response => response.json())
        .then(data =>{
            this.services = data;
        })
    },
    methods: {
        viewProfile(professional){
            this.divViewProfileVariable = true;
            this.profile_picture_professional = professional.profile_picture
        },
        closeViewProfile(){
            this.divViewProfileVariable = false;
        },
        setcondition(val){
            this.$store.commit('setcondition',val)
        },
        delete_professional(id,name){
            const confirmed = window.confirm('Do You want to Delete Professional with name: ' + name);
            if(confirmed){
                fetch('/api/delProfessionals',{
                    method:'post',
                    body:JSON.stringify({id:id}),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                    }
                })
            }
        },
        blockProfessional(id,name) {
            const confirmed = window.confirm('Do You want to Block Professional with name: ' + name);
            if(confirmed){
                fetch('/api/blockProfessional',{
                    method:'post',
                    body:JSON.stringify({id:id}),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                        // alert(data.message);
                    }
                })
            }
        },
        unBlockProfessional(id,name){
            const confirmed = window.confirm('Do You want to Unblock Professional with name: ' + name);
            if(confirmed){
                
                fetch('/api/unBlockProfessional',{
                    method:'post',
                    body:JSON.stringify({id:id}),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                        // alert(data.message);
                    }
                })
            }
        },
        approveProfessional(id,name){
            const confirmed = window.confirm('Do you want to approve Professional with name: ' + name);
            if(confirmed){
                fetch('/api/approveProfessional',{
                    method:'post',
                    body:JSON.stringify({id:id}),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        window.location.reload();
                        // alert(data.message);
                    }
                })
            }
        },
        setprofessionalInfo(val){
            this.$store.commit('setprofessionalInfo',val)
        },
        assign(id,name,email){
            this.service_assign_variable = true;
            this.prof_name = name;
            this.prof_email = email;
        },
        close_assignment(){
            this.service_assign_variable = false;
            window.location.reload();
        },
        assign_service(email){
            fetch(`/api/send_notification?service=${this.selectedService}`,{
                    method:'POST',
                    body:JSON.stringify({email:email}),
                    headers: {
                        'Content-Type':'application/json',
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.service_assign_variable = false;
                    window.location.reload();
                }
            })
        },
        openId(professionalObject){
            
            this.professional.professional_name = professionalObject.fullname
            this.professional.professional_email = professionalObject.email
            this.professional.professional_password = professionalObject.password
            this.professional.professional_phone = professionalObject.phone
            this.professional.professional_address = professionalObject.address
            this.professional.professional_pincode = professionalObject.pin_code;
            this.professional.professional_profilePicture = professionalObject.profile_picture;
            this.professional.professional_experience = professionalObject.Experience;
            this.professional.professional_rating = professionalObject.rating;
            this.showIdVariable = true;
        },
        close_box(){
            this.showIdVariable = false;
        },
        searchServiceReq:function() {
            if (this.searchQuery.professionalDetail) {
                const params = new URLSearchParams({
                    professionalDetail: this.searchQuery.professionalDetail,
                }).toString();

                fetch(`/api/searchProfessional?${params}`)
                    .then(response => response.json())
                    .then(data => {
                        this.searchResults = data;
                        this.searched = true;
                    })
                    .catch(error => console.error("Error fetching search results:", error));
            } else {
                // Clear search results if both fields are empty
                this.searchResults = [];
                this.searched = false;
            }
        },
    }
};

const Services = {
    template: `
        <div>
            <button @click="setcondition(2)" class="btn btn-dark mb-2">+ ADD</button>
            <table class="table table-striped table-hover table-bordered shadow-sm rounded">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Service Id</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in services" :key="service.service_id">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openId(service)">
                            {{ service.service_id }}
                        </button>
                        <td>{{ service.service_name }}</td>
                        <td>{{ service.description }}</td>
                        <td>
                            <button @click="delete_service(service.service_id)" class="btn btn-danger btn-sm ml-2">
                                Delete
                            </button>
                            <button @click="edit_service(service.service_id)" class="btn btn-primary btn-sm ml-2">
                                Edit
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- -----------------------------------------------------------Show ID parts------------------------------------------------------ -->

            <div v-if="showIdVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">About {{ service.service_name }}</h5>
                        <p class="text-muted">Service Details</p>
                    </div>

                    <!-- Service Details Section -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-info-circle-fill me-2"></i>Description:</h6>
                            <p class="text-dark">{{ service.service_description }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-clock-fill me-2"></i>Time Required:</h6>
                            <p class="text-dark">{{ service.service_time_required }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-cash-stack me-2"></i>Base Price:</h6>
                            <p class="text-dark">{{ service.service_base_price }}</p>
                        </div>
                        <div class="mb-3">
                            <div v-if="service.service_review && service.service_review.length > 0">
                                <h6 class="text-secondary"><i class="bi bi-chat-left-text-fill me-2"></i>Review:</h6>
                                <p class="text-dark">
                                    <ul class="list-unstyled">
                                        <li v-for="(review, reviewIndex) in service.service_review" :key="reviewIndex" class="text-muted">
                                            <strong>{{ review.customer_name }}:</strong> {{ review.review }}
                                        </li>
                                    </ul>
                                </p>
                            </div>
                            <div class="text-muted" v-else>
                                <small>No reviews yet</small>
                            </div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>


        </div>

    `,
    data() {
        return {
            services : [],
            showIdVariable : false,
            service:{
                service_name:'',
                service_description:'',
                service_time_required:'',
                service_base_price:'',
                service_review:'',
            }
        }
    },
    mounted() {
        fetch('/api/getServices')
        .then(response => response.json())
        .then(data =>{
            if(data){
                this.services = data;
            }
        })
    },
    methods: {
        setcondition(value){
            this.$store.commit('setcondition',value)
        },
        
        delete_service(id){
            const confirmed = window.confirm("Are you sure you want to delete this item?");
            if(confirmed){
                const formData=new FormData();
                formData.append('id',id)
                fetch('/api/delService',{
                        method:'POST',
                        body:formData
                    })
                .then(response=>response.json())
                .then(data=>{
                    if(data.success){
                        this.services = this.services.filter(service => service.id !== id);
                        window.location.reload();
                        alert(data.message)
                    }else{
                        alert('Deleting Error!')
                    }
                })
            }else{
                window.location.reload();
            }
            
        },
        edit_service(id){
            let service_id = id
            for(let i = 0; i < this.services.length; i++){
                if(this.services[i]['service_id']===service_id){
                    this.setServiceInfo(this.services[i])
                    // alert('All Set')
                    this.setcondition(5);
                }
            }
        },
        setServiceInfo(val){
            this.$store.commit('setServiceInfo',val);
        },
        parsedCapacity(capacity) {
            // If capacity is a JSON string, parse it; otherwise return the original value
            try {
                return JSON.parse(capacity).join(', ');  // Display the seat availability or details as a string
            } catch (error) {
                return capacity;  // If not parsable, return the raw capacity
            }
        },
        openId(serviceObject){
            this.service.service_name = serviceObject.service_name
            this.service.service_description = serviceObject.description
            this.service.service_time_required = serviceObject.time_required
            this.service.service_base_price = serviceObject.base_price
            this.service.service_review = serviceObject.review;
            this.showIdVariable = true;
        },
        close_box(){
            this.showIdVariable = false;
        }
    }
};

const Service_request = {
    template: `
        <div>
            <button @click="downloadCSV" type="button" class="btn btn-primary mb-2">Download CSV</button>
            
            <table class="table table-striped table-hover table-bordered shadow-sm rounded">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Request ID</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Status</th>
                        <th scope="col">Request Date</th>
                        <th scope="col">Completion Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ServiceRequest in ServiceRequests" :key="ServiceRequest.request_id">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openId(ServiceRequest)">
                            {{ ServiceRequest.request_id }}
                        </button>
                        <td>{{ ServiceRequest.service_name }}</td>
                        <td>{{ ServiceRequest.status }}</td>
                        <td>{{ ServiceRequest.request_date }}</td>
                        <td v-if="completionCheck(ServiceRequest.completion_date)">It's Not Completed YET!!</td>
                        <td v-else>{{ ServiceRequest.completion_date }}</td>
                        
                    </tr>
                </tbody>
            </table>
            <!-- -----------------------------------------------------------Show ID parts------------------------------------------------------ -->

            <div v-if="showIdVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">Service Request Details - ID: {{ serviceRequest.request_id }}</h5>
                        <p class="text-muted">Comprehensive Details of the Request</p>
                    </div>
                    
                    <!-- Service Request Details -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-wrench-adjustable-circle me-2"></i>Service Name:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_service_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-person-workspace me-2"></i>Professional Name:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_professional_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-person-fill me-2"></i>Customer Name:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_customer_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-clipboard-check-fill me-2"></i>Status:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_status }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-calendar-event-fill me-2"></i>Request Date:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_request_date }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-calendar-check-fill me-2"></i>Completion Date:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_completion_date || 'Pending' }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-chat-right-dots-fill me-2"></i>Remarks:</h6>
                            <p class="text-dark">{{ serviceRequest.serviceRequest_remarks || 'No remarks available' }}</p>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>


        </div>

    `,
    data() {
        return {
            ServiceRequests: [],
            showIdVariable:false,
            serviceRequest:{
                serviceRequest_service_name:'',
                serviceRequest_professional_name:'',
                serviceRequest_customer_name:'',
                serviceRequest_status:'',
                serviceRequest_request_date:'',
                serviceRequest_completion_date:'',
                serviceRequest_remarks:'',
            },

        }
    },
    mounted() {
        fetch('/api/getServiceRequest')
        .then(response => response.json())
        .then(data =>{
            this.ServiceRequests = data;
        })
    },
    methods: {
        setcondition(val){
            this.$store.commit('setcondition',val)
        },
        openId(serviceRequestObject){
            this.serviceRequest.serviceRequest_service_name = serviceRequestObject.service_name
            this.serviceRequest.serviceRequest_professional_name = serviceRequestObject.professional_name
            this.serviceRequest.serviceRequest_customer_name = serviceRequestObject.customer_name
            this.serviceRequest.serviceRequest_status = serviceRequestObject.status;
            this.serviceRequest.serviceRequest_request_date = serviceRequestObject.request_date;
            this.serviceRequest.serviceRequest_completion_date = serviceRequestObject.completion_date;
            this.serviceRequest.serviceRequest_remarks = serviceRequestObject.remarks;
            this.showIdVariable = true;
        },
        close_box(){
            this.showIdVariable = false;
        },
        completionCheck(completion_date) {
            return completion_date === null;
        },
        async downloadCSV() {
            try {
                const res = await fetch('/download-csv');
                if (!res.ok) {
                    throw new Error('Failed to start CSV generation.');
                }
                const data = await res.json();
                
                if (data["task-id"]) {
                    const taskId = data["task-id"];

                    // Polling for the CSV generation completion
                    const intv = setInterval(async () => {
                        try {
                            const csv_res = await fetch(`/get-csv/${taskId}`);
                            if (csv_res.ok) {
                                clearInterval(intv);
                                // Redirect to download the CSV file
                                window.location.href = `/get-csv/${taskId}`;
                            }
                        } catch (error) {
                            console.error('Polling error:', error);
                        }
                    }, 1000);
                } else {
                    console.error('No task ID returned.');
                }
            } catch (error) {
                console.error('Download error:', error);
            }
        }
    },
    computed:{
        
    }
};

const Reviews = {
    template: `
        <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover">
                <thead class="thead-dark">
                    <tr class="text-left text-sm">
                        <th class="py-3 px-4 text-uppercase font-weight-bold">Service Name</th>
                        <th class="py-3 px-4 text-uppercase font-weight-bold">Customer Name</th>
                        <th class="py-3 px-4 text-uppercase font-weight-bold">Review</th>
                    </tr>
                </thead>
                <tbody class="text-dark">
                    <tr v-for="review in reviews">
                        <td class="py-3 px-4">{{ review.service_name }}</td>
                        <td class="py-3 px-4">{{ review.user_name }}</td>
                        <td class="py-3 px-4">{{ review.review }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    `,
    data() {
        return {
            reviews: []
        }
    },
    mounted() {
        fetch('/api/getReviews')
            .then(response => response.json())
            .then(data => {
                this.reviews = data;
            });
    },
    methods: {
        deleteSponsor(id) {
            alert('Delete sponsor with ID: ' + id);
        }
    }
};

// -------------------------------------------------------- CUSTOMER APP ---------------------------------------------------- //

const CustomerAPP = {
    template:`
    <div>
        <div v-if="my_personal_alert_variable" :class="alertClasses" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
            <strong>{{ alert_message }}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>

        <div v-if="this.$store.state.main_app_condition===0">
            <!-- First Navbar -->
            <nav class="navbar navbar-expand-lg bg-light px-4 py-3">
                <div class="container-fluid">
                    <a class="navbar-brand text-danger" href="#">{{ $store.state.title }}</a>
                    
                    <div class="ml-auto">
                        <router-link to="/">
                            <button @click="logout" class="btn btn-outline-dark">
                                Log-out
                            </button>
                        </router-link>
                    </div>
                </div>
            </nav>
            <!-- Second Navbar -->
            <nav class="navbar navbar-expand-lg bg-danger bg-gradient px-4 py-2">
                <div class="container-fluid">
                    <!-- Left side links -->
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link to="/user/customer_home" class="nav-link text-white">Home</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/user/customer_search" class="nav-link text-white">Search</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/user/customer_stats" class="nav-link text-white">Statistics</router-link>
                        </li>
                    </ul>

                    <!-- Right side links -->
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link to="/user/customer_notify" class="nav-link text-white">Notifications</router-link>
                        </li>
                    </ul>
                </div>
            </nav>
            <!-- Profile Button below navbars -->
            <div class="container-fluid my-3">
                <div class="d-flex justify-content-end">
                    <button class="btn btn-primary" @click="set_main_app_condition(1,0)">
                        Profile
                    </button>
                </div>
            </div>
            <router-view></router-view>
        </div>

        
        <!---------------------------------------------------------------------------------------------------------------------------------->
        <!-------------------------------------------------------- PROFILE SECTION  -------------------------------------------------------->
        <!---------------------------------------------------------------------------------------------------------------------------------->


        <div v-if="this.$store.state.main_app_condition===1">
            <!-- Profile Page -->
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card shadow">
                            <!-- Profile Header -->
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h3 class="mb-0">User Profile</h3>
                                <!-- Edit Button -->
                                <button class="btn btn-outline-light" @click="set_main_app_condition(0,0)">
                                    Go Back
                                </button>
                                <!-- Edit Button -->
                                <button class="btn btn-outline-light" @click="set_main_app_condition(2,0)">
                                    Edit
                                </button>
                            </div>

                            <!-- Profile Body -->
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Full Name:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ this.user.fullname }} <!-- Display Name -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Email:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ this.user.email }} <!-- Display Email -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Phone:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ this.user.phone }} <!-- Display Phone -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Address:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ this.user.address }} <!-- Display Address -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Joined:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ this.user.pincode }} <!-- Display Joining Date -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="this.$store.state.main_app_condition===2">

            <!-- Edit Profile Page -->
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card shadow">
                            <!-- Edit Profile Header -->
                            <div class="card-header bg-success text-white">
                                <h3 class="mb-0">Edit Profile</h3>
                                <button class="btn btn-outline-light" @click="set_main_app_condition(1,0)">
                                    Go Back
                                </button>
                            </div>

                            <!-- Edit Profile Body -->
                            <div class="card-body">
                                <div class="mb-3">
                                <label for="fullname" class="form-label">Full Name:</label>
                                <input type="text" id="fullname" v-model="user.fullname" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="phone" class="form-label">Phone:</label>
                                <input type="text" id="phone" v-model="user.phone" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="address" class="form-label">Address:</label>
                                <input type="text" id="address" v-model="user.address" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="address" class="form-label">Pincode:</label>
                                <input type="text" id="pincode" v-model="user.pincode" class="form-control">
                                </div>

                                <!-- Save Changes Button -->
                                <button type="submit" @click="edit_profile" class="btn btn-success mt-3 w-100">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    </div>
    `,
    data() {
        return {
            user:{
                fullname:"",
                email:"",
                phone:"",
                address:"",
                pincode:"",
            },
            my_personal_alert_variable:false,
            alert_message:'',
            alert_color:'',
        }
    },
    methods:{
        logout(){
            fetch("/api/logout")
                .then((res) => {
                    if (res.ok) {
                    alert("Logged out Successfully")
                }
                }).catch((err) => {
                alert("Error occured during logging out")
            })
        },
        set_main_app_condition(val1, val2) {
            this.$store.commit('set_main_app_condition', { value1: val1, value2: val2 });
        },
        edit_profile(){
            let email = localStorage.getItem('Customer_email');
            const formData = new FormData();

            formData.append('fullname', this.user.fullname);
            formData.append('phone', this.user.phone);
            formData.append('address', this.user.address);
            formData.append('pincode', this.user.pincode);
            fetch(`/api/edit_profile_user?email=${email}`,{
                method:'post',
                body:formData
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.set_main_app_condition(1,0);
                    this.my_personal_alert('success',data.message);
                }
            })
        },
        close_my_personal_alert(){
            this.my_personal_alert_variable = false;
            this.alert_message = '';
            this.alert_color = '';
        },
        my_personal_alert(color,message){
            this.my_personal_alert_variable = true;
            this.alert_message = message;
            this.alert_color = color;
        },
    },
    mounted(){

        let email = localStorage.getItem('Customer_email')

        fetch(`/api/getusers?email=${email}`)
        .then(response=>response.json())
        .then(data=>{
            this.user.fullname = data.fullname;
            this.user.email = data.email;
            this.user.phone = data.phone;
            this.user.address = data.address;
            this.user.pincode = data.pin_code;
        })


        
        
    },
    computed:{
        alertClasses() {
            return `alert alert-${this.alert_color} alert-dismissible fade show`;
        },
    }
}

const customerHome = {
    template:`
        <div>
            <div v-if="my_personal_alert_variable" :class="alertClasses" role="alert">
                <strong>{{ alert_message }}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>


            <!-- Expanded Box -->
            <div class="container my-4 p-4 bg-white shadow-sm rounded">
                <h3 class="text-primary mb-4">What Are You Looking For?</h3>

                <div class="row row-cols-1 row-cols-md-2 g-4">
                    <!-- Service Cards -->
                    <div v-for="(service, index) in limitedServices" :key="service.service_id" class="col">
                        <div class="card h-100 border-light shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title text-dark">
                                    <i class="bi bi-briefcase-fill text-primary"></i> {{ service.service_name }}
                                </h5>

                                <div class="d-flex justify-content-between align-items-start">
                                    <!-- Estimated Time and Base Price -->
                                    <div>
                                        <p class="card-text text-muted mb-1">
                                            <i class="bi bi-clock text-secondary me-1"></i> Estimated Time: <strong>{{ service.time_required }}</strong>
                                        </p>
                                        <p class="card-text text-muted mb-1">
                                            <i class="bi bi-cash-coin text-success me-1"></i> Base Price: <strong>{{ service.base_price }}</strong>
                                        </p>
                                    </div>

                                    <!-- Reviews Section -->
                                    <div class="ms-3" v-if="service.review && service.review.length > 0">
                                        <h6 class="text-muted"><i class="bi bi-chat-left-text-fill me-2"></i>Reviews:</h6>
                                        <ul class="list-unstyled">
                                            <li v-for="(review, reviewIndex) in service.review" :key="reviewIndex" class="text-muted">
                                                <strong>{{ review.user_name }}:</strong> {{ review.review }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="ms-3 text-muted" v-else>
                                        <small>No reviews yet</small>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <button class="btn btn-outline-primary btn-sm mt-3 me-3" @click="selectService(service)">
                                    <i class="bi bi-search"></i> View Details
                                </button>
                                <button class="btn btn-outline-success btn-sm mt-3" @click="giveReview(service)">
                                    <i class="bi bi-chat-left-text"></i> Give Reviews
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Info -->
                <div class="text-center mt-4">
                    <h1 class="text-muted">...</h1>
                    <p class="text-muted">Find more services from the search menu!</p>
                </div>
            </div>


            <!-- -----------------------------------------------------------Service Details------------------------------------------------------ -->

            <div v-if="showServiceDetails" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">About {{ service.service_name }}</h5>
                        <p class="text-muted">Service Details</p>
                    </div>

                    <!-- Service Details Section -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-info-circle-fill me-2"></i>Description:</h6>
                            <p class="text-dark">{{ service.service_description }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-clock-fill me-2"></i>Time Required:</h6>
                            <p class="text-dark">{{ service.service_time_required }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-cash-stack me-2"></i>Base Price:</h6>
                            <p class="text-dark">{{ service.service_base_price }}</p>
                        </div>
                        <div class="mb-3">
                            <div v-if="service.service_review && service.service_review.length > 0">
                                <h6 class="text-secondary"><i class="bi bi-chat-left-text-fill me-2"></i>Review:</h6>
                                <p class="text-dark">
                                    <ul class="list-unstyled">
                                        <li v-for="(review, reviewIndex) in service.service_review" :key="reviewIndex" class="text-muted">
                                            <strong>{{ review.user_name }}:</strong> {{ review.review }}
                                        </li>
                                    </ul>
                                </p>
                            </div>
                            <div class="text-muted" v-else>
                                <small>No reviews yet</small>
                            </div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 me-4 rounded-pill">Close</button>
                        <button @click="chooseProfessional" class="btn btn-outline-primary px-4 py-2 rounded-pill">Book</button>
                    </div>
                </div>
            </div>




            <!-- -----------------------------------------------------------Choose Professional------------------------------------------------------ -->


            <div v-if="showProfessionalDetails" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <!-- Small Heading for Title -->
                    <h5 class="text-primary mb-3">Professionals in the {{service.service_name}}</h5>
                    <!-- Service Type Input Box -->
                    <div class="form-group mb-4">
                        <label for="serviceType">Select Professional Type</label>
                        <select id="serviceType" v-model="selectedProfessional" class="form-control">
                            <option v-for="aspf in assignedProfessionals" :key="aspf.professional_id" :value="aspf.fullname">
                                {{ aspf.fullname }}
                            </option>
                        </select>
                    </div>
                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="closeChooseProfessionals" class="btn btn-danger ms-auto">Close</button>
                        <button @click="finalBookingService" class="btn btn-success ms-auto">Confirm</button>
                    </div>
                </div>
            </div>

            <!-- -----------------------------------------------------------Closing Parts------------------------------------------------------ -->


            <div v-if="closingProcess" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <h5 class="text-primary mb-3">Professionals in the {{service.service_name}}</h5>
                    <div class="form-group mb-4">
                        <label for="serviceType">Select Professional Type</label>
                        <select id="serviceType" v-model="selectedProfessional" class="form-control">
                            <option v-for="aspf in assignedProfessionals" :key="aspf.professional_id" :value="aspf.fullname">
                                {{ aspf.fullname }}
                            </option>
                        </select>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="closeChooseProfessionals" class="btn btn-danger ms-auto">Close</button>
                        <button @click="finalBookingService" class="btn btn-success ms-auto">Confirm</button>
                    </div>
                </div>
            </div>

            <!-- -----------------------------------------------------------Reviews Parts------------------------------------------------------ -->


            <div v-if="reviewCustomer" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <!-- Title -->
                    <h4 class="text-center mb-4">Service Reviews</h4>

                    <!-- Review List -->
                    <div v-if="serviceReviews && serviceReviews.length > 0" style="max-height: 300px; overflow-y: auto;">
                        <ul class="list-group">
                            <li v-for="(review, index) in serviceReviews" :key="index" class="list-group-item d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold">{{ review.user_name }} on {{ review.service_name }}</div>
                                    <p>{{ review.review }}</p>
                                </div>

                                <!-- Edit/Delete Buttons for Logged-in Customer -->
                                <div v-if="review.customer_id === loggedInCustomerId" class="ms-auto">
                                    <button @click="editReview(review, index)" class="btn btn-sm btn-outline-primary me-2">Edit</button>
                                    <button @click="deleteReview(review, index)" class="btn btn-sm btn-outline-danger">Delete</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div v-else class="text-muted text-center">
                        No reviews available for this service.
                    </div>

                    <!-- Add/Edit Review Input -->
                    <div class="mt-4">
                        <label for="newReview" class="form-label">{{ isEditing ? 'Edit Your Review:' : 'Add a Review:' }}</label>
                        <input v-model="newReview" id="newReview" type="text" class="form-control" placeholder="Write your review here..." />
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="closeReview" class="btn btn-danger">Close</button>
                        <button @click="addReview" class="btn btn-success">{{ isEditing ? 'Update Review' : 'Submit Review' }}</button>
                    </div>
                </div>
            </div>



            <!-- -------------------------------------------------------Second Box with Title Outside-------------------------------------------------- -->

            <div class="container my-4">
                <h3 class="text-primary mb-4">Service History</h3>
                
                <div v-for="(service, index) in serviceHistory" :key="index" class="p-4 bg-white border rounded mb-3 shadow-sm">
                    <!-- Request ID -->
                    <h5 class="text-dark mb-2">
                        <i class="bi bi-hash text-primary"></i> Request ID: <strong>{{ service.request_id }}</strong>
                    </h5>
                    
                    <!-- Service Name -->
                    <h5 class="text-primary mb-2">
                        <i class="bi bi-briefcase-fill text-success"></i> Service: <strong>{{ service.service_name }}</strong>
                    </h5>
                    
                    <!-- Professional Name -->
                    <h5 class="text-secondary mb-2">
                        <i class="bi bi-person-fill text-warning"></i> Professional: <strong>{{ service.professional_name }}</strong>
                    </h5>

                    <!-- Service Status -->
                    <p class="text-muted mb-2">
                        <i class="bi bi-info-circle text-info"></i> Status: <strong>{{ service.status }}</strong>
                    </p>
                    
                    <!-- Completion Date -->
                    <p class="small text-secondary">
                        <i class="bi bi-calendar-check text-success"></i> Completed on: {{ service.completion_date }}
                    </p>

                    <button v-if="checkService(service)" 
                    class="btn btn-outline-warning btn-sm mt-3" 
                    @click="closeButGivingRemarks(service)">
                        Close?
                    </button>

                    <button v-else-if="service.closed === 1" class="btn btn-danger btn-sm mt-3">
                        Closed
                    </button>
                    <button v-else class="btn btn-success btn-sm mt-3">
                        Going On
                    </button>
                    <button @click="edit_serviceReq(service)" class="btn btn-primary btn-sm mt-3 ms-2">
                        Edit
                    </button>
                </div>
                <div v-if=" serviceHistory.length == 0 " class="py-4">
                    <p class="lead text-muted">Till now, there is no service.</p>
                </div>
            </div>

            <!-- -------------------------------------------------------Service Request Editings-------------------------------------------------- -->
            
            <div v-if="serviceReqVariableForEditing" class="mt-5">
                <div class="container mt-4">
                    <div class="bg-dark text-white p-3 rounded shadow">
                        <button @click="closeEditServiceReq" class="btn btn-warning mb-3">Close</button>
                        <div class="bg-secondary text-white rounded p-2 mb-3">
                            <p class="h4">Edit Service Request</p>
                        </div>
                        <form @submit.prevent="editService" method="post" class="row g-3" enctype="multipart/form-data">
                            <div class="col-md-6">
                                <label class="form-label text-light">Status</label>
                                <select v-model="editServiceReqInfo.status" class="form-control" required>
                                    <option value="Requested">Requested</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-light">Remarks</label>
                                <input v-model="editServiceReqInfo.remarks" class="form-control" type="text" required>
                            </div>
                            <div class="col-md-12">
                                <button class="btn btn-warning w-100" type="submit">Edit Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



            <!-- -------------------------------------------------------Service Request Variable-------------------------------------------------- -->

            <div v-if="serviceReqvariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <h5 class="text-primary mb-3">Rating</h5>
                    <div class="form-group mb-3">
                        <label for="professionalRating">Professional Rating (1-5)</label>
                        <input id="professionalRating" v-model.number="professionalRating" type="number" min="1" max="5" class="form-control" placeholder="Rate the professional" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="serviceReqRating">Service Request Rating (1-5)</label>
                        <input id="serviceReqRating" v-model.number="serviceReqRating" type="number" min="1" max="5" class="form-control" placeholder="Rate the service request" />
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="closeServiceReqVariable" class="btn btn-danger ms-auto">Close</button>
                        <button @click="closeServiceRequest" class="btn btn-success ms-auto">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            services_list : [],
            showServiceDetails : false,
            showProfessionalDetails : false,
            service:{
                service_name:'',
                service_description:'',
                service_time_required:'',
                service_base_price:'',
                service_review:'',
            },
            ReviewServiceOBJ:{
                service_id:0,
                service_name:'',
                service_description:'',
                service_time_required:'',
                service_base_price:'',
                service_review:'',
            },
            serviceReqClosingID: 0,
            serviceReqvariable: false,
            professionalRating: 0,
            serviceReqRating: 0,
            assignedProfessionals: [],
            selectedProfessional: '',
            serviceHistory: [],
            closingProcess: false,
            reviewCustomer: false,
            serviceReviews: [],
            newReview: "",
            oldReview: "",
            loggedInCustomerId: 0,
            isEditing: false,
            editIndex: null,
            my_personal_alert_variable:false,
            alert_message:'',
            alert_color:'',
            serviceReqVariableForEditing:false,
            editServiceReqInfo:{
                request_id:'',
                status:'',
                remarks:''
            }
        }
    },
    methods:{
        checkService(service){
            return service.closed === 0 && (service.status !== 'Requested' || service.status !== 'In Progress')
        },
        set_main_app_condition(val1, val2) {
            this.$store.commit('set_main_app_condition', { value1: val1, value2: val2 });
        },
        selectService(serviceObject){
            this.service.service_name = serviceObject.service_name
            this.service.service_description = serviceObject.description
            this.service.service_time_required = serviceObject.time_required
            this.service.service_base_price = serviceObject.base_price
            this.service.service_review = serviceObject.review;
            this.showServiceDetails = true;
        },
        close_box(){
            this.showServiceDetails = false;
        },
        chooseProfessional(){
            this.showProfessionalDetails = true;
            fetch(`/api/assignedProfessional?serviceName=${this.service.service_name}`)
            .then(response=>response.json())
            .then(data=>{
                console.log(data)
                this.assignedProfessionals = data;
            })
            
        },
        finalBookingService(){
            let CustomerEmail = localStorage.getItem('Customer_email');
            const formData = new FormData();
            formData.append('choosedProfessional',this.selectedProfessional);
            formData.append('CustomerEmail',CustomerEmail);
            formData.append('service_name',this.service.service_name);
            window.location.reload();
            fetch(`/api/serviceRequest`,{
                    method:'post',
                    body:formData,
                    headers:{
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    alert(data.message);
                }
            })
            fetch(`/api/send_notification`,{
                    method:'post',
                    body:JSON.stringify({
                        choosedProfessional : this.selectedProfessional,
                        service_name : this.service.service_name,
                        userEmail : CustomerEmail
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.sccuess){
                    console.log(data.message)
                }
            })

        },
        closeChooseProfessionals(){
            this.showProfessionalDetails = false;
        },
        closeServiceRequest(){
            window.location.reload();
            fetch(`/api/closeServiceRequest`,{
                body:JSON.stringify({
                    servReqId : this.serviceReqClosingID,
                    profRating : this.professionalRating,
                    servReqRating : this.serviceReqRating
                }),
                method:'post',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-Token':localStorage.getItem('token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    alert(data.message);
                }
            })
        },
        closeButGivingRemarks(service){
            this.serviceReqvariable = true;
            this.serviceReqClosingID = service.request_id;
        },
        closeServiceReqVariable(){
            this.serviceReqvariable = false;
        },
        closeReview(){
            this.reviewCustomer = false;
            this.serviceReviews = [];
            this.$forceUpdate();
        },
        giveReview(service){
            let cust_email = localStorage.getItem('Customer_email');
            fetch(`/api/getusers?email=${cust_email}`, {
                headers: {
                    "Authentication-Token": localStorage.getItem("token")
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.loggedInCustomerId = data.customer_id
            })
            this.reviewCustomer = true;
            this.ReviewServiceOBJ.service_id = service.service_id
            this.ReviewServiceOBJ.service_name = service.service_name
            this.ReviewServiceOBJ.service_description = service.description
            this.ReviewServiceOBJ.service_time_required = service.time_required 
            this.ReviewServiceOBJ.service_base_price = service.base_price
            this.ReviewServiceOBJ.service_review = service.review
            
            fetch(`/api/getReviews?service=${service.service_id}`)
            .then(response=>response.json())
            .then(data=>{
                if(data.success === false){
                    
                }else{
                    this.serviceReviews=data;
                }
            })
        },
        addReview(){
            let CustomerEmail = localStorage.getItem('Customer_email');
            if(this.isEditing){
                console.log(this.newReview)
                if (this.newReview.trim() !== "") {
                    fetch(`/api/editReviews`,{
                        method:'post',
                        body:JSON.stringify({
                            userEmail : CustomerEmail,
                            serviceId : this.ReviewServiceOBJ.service_id,
                            NEWreview : this.newReview,
                            OLDreview : this.oldReview
                        }),
                        headers:{
                            'Content-Type':'application/json',
                            'Authentication-Token':localStorage.getItem('token')
                        }
                    })
                        .then(response=>response.json())
                        .then(data=>{
                            if(data.success){
                                this.newReview = "";
                                this.oldReview = "";
                                this.isEditing = false;
                            }
                        })
                    console.log(this.oldReview);
                }
            }else{
                if (this.newReview.trim() !== "") {
                    fetch(`/api/postReview`,{
                        method:'post',
                        body:JSON.stringify({
                            userEmail : CustomerEmail,
                            serviceId : this.ReviewServiceOBJ.service_id,
                            review : this.newReview
                        }),
                        headers:{
                            'Content-Type':'application/json',
                            'Authentication-Token':localStorage.getItem('token')
                        }
                    })
                    .then(response=>response.json())
                    .then(data=>{
                        if(data.success){
                            console.log(data.message);
                            this.newReview = "";
                        }
                    })
                }
            }
            

        },
        editReview(review, index) {
            this.oldReview = review.review;
            this.newReview = review.review;
            this.isEditing = true;
            this.editIndex = index;
        },
        close_my_personal_alert(){
            this.my_personal_alert_variable = false;
            this.alert_message = '';
            this.alert_color = '';
        },
        my_personal_alert(color,message){
            this.my_personal_alert_variable = true;
            this.alert_message = message;
            this.alert_color = color;
        },
        deleteReview(review,index) {
            let confirmed = window.confirm("Do you want to delete?")
            if(confirmed){
                fetch(`/api/deleteReviews`,{
                    method:'post',
                    body:JSON.stringify({
                        review : review.review,
                        service_id : review.service_id,
                        user_id : review.user_id
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                    window.location.reload();
                    this.my_personal_alert('danger',data.message);

                })
            }
        },
        edit_serviceReq(service){
            this.serviceReqVariableForEditing = true;
            this.editServiceReqInfo.status = service.status;
            this.editServiceReqInfo.remarks = service.remarks;
            this.editServiceReqInfo.request_id = service.request_id;

        },
        editService(){
            const formData = new FormData();
            formData.append('status', this.editServiceReqInfo.status);
            formData.append('remarks', this.editServiceReqInfo.remarks);
            formData.append('request_id', this.editServiceReqInfo.request_id);
            fetch('/api/editServiceRequest', {
                method: 'POST',
                body: formData,
                headers: {
                    "Authentication-Token": localStorage.getItem("token")
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    this.serviceReqVariableForEditing = false;
                } else {
                    alert('Failed to edit theatre');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        closeEditServiceReq(){
            this.serviceReqVariableForEditing = false;
        }
    },
    mounted(){
        this.$forceUpdate();
        fetch('/api/getServices')
        .then(response => response.json())
        .then(data =>{
            if(data){
                this.services_list = data;
                this.$forceUpdate();
            }
        })
        let customer_email = localStorage.getItem('Customer_email')
        fetch(`/api/getServiceRequest?email=${customer_email}`)
        .then(response=>response.json())
        .then(data=>{
            this.serviceHistory = data;
            this.$forceUpdate();
        })
        this.$forceUpdate();
    },
    computed: {
        limitedServices() {
          return this.services_list.slice(0, 4);
          this.$forceUpdate();
        },
        alertClasses() {
            return `alert alert-${this.alert_color} alert-dismissible fade show`;
        },
    },

}

const customerSearch = {
    template: `
        <div class="container my-4">
            <div class="d-flex flex-column flex-md-row align-items-center">
                <!-- Service Name Input -->
                <input v-model="searchQuery.serviceName" @input="searchService" type="text" 
                       class="form-control rounded-lg ml-3 mb-2 mb-md-0" placeholder="Search by Service Name">
                
                <!-- Time Required Input -->
                <input v-model="searchQuery.timeRequired" @input="searchService" type="text" 
                       class="form-control rounded-lg ml-3 mb-2 mb-md-0" placeholder="Time Required (e.g., 2 hours)">
            </div>
            
            <!-- Displaying Results -->
            <div v-if="searchResults.length > 0" class="mt-4">
                <h5 class="text-primary">Search Results</h5>
                <div v-for="(service, index) in searchResults" :key="index" class="p-3 mb-3 bg-white border rounded shadow-sm">
                    <h5 class="text-dark">{{ service.service_name }}</h5>
                    <p class="text-muted">Estimated Time: {{ service.time_required }}</p>
                    <p class="text-muted">Base Price: {{ service.base_price }}</p>
                    <button class="btn btn-outline-primary btn-sm mt-3" @click="selectService(service)">
                        <i class="bi bi-search"></i> View Details
                    </button>
                </div>
            </div>
            <div v-else-if="searched" class="mt-4">
                <p class="text-muted">No results found for your criteria</p>
            </div>


            <!-- -----------------------------------------------------------Service Details------------------------------------------------------ -->

            <div v-if="showServiceDetails" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">About {{ service.service_name }}</h5>
                        <p class="text-muted">Service Details</p>
                    </div>

                    <!-- Service Details Section -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-info-circle-fill me-2"></i>Description:</h6>
                            <p class="text-dark">{{ service.service_description }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-clock-fill me-2"></i>Time Required:</h6>
                            <p class="text-dark">{{ service.service_time_required }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-cash-stack me-2"></i>Base Price:</h6>
                            <p class="text-dark">{{ service.service_base_price }}</p>
                        </div>
                        <div class="mb-3">
                            <div v-if="service.service_review && service.service_review.length > 0">
                                <h6 class="text-secondary"><i class="bi bi-chat-left-text-fill me-2"></i>Review:</h6>
                                <p class="text-dark">
                                    <ul class="list-unstyled">
                                        <li v-for="(review, reviewIndex) in service.service_review" :key="reviewIndex" class="text-muted">
                                            <strong>{{ review.customer_name }}:</strong> {{ review.review }}
                                        </li>
                                    </ul>
                                </p>
                            </div>
                            <div class="text-muted" v-else>
                                <small>No reviews yet</small>
                            </div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 me-4 rounded-pill">Close</button>
                        <button @click="chooseProfessional" class="btn btn-outline-primary px-4 py-2 rounded-pill">Book</button>
                    </div>
                </div>
            </div>




            <!-- -----------------------------------------------------------Choose Professional------------------------------------------------------ -->


            <div v-if="showProfessionalDetails" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style="z-index: 1050;">
                <div class="bg-white p-4 rounded shadow-lg" style="max-width: 500px; width: 100%;">
                    <!-- Small Heading for Title -->
                    <h5 class="text-primary mb-3">Professionals in the {{service.service_name}}</h5>
                    <!-- Service Type Input Box -->
                    <div class="form-group mb-4">
                        <label for="serviceType">Select Professional Type</label>
                        <select id="serviceType" v-model="selectedProfessional" class="form-control">
                            <option v-for="aspf in assignedProfessionals" :key="aspf.professional_id" :value="aspf.fullname">
                                {{ aspf.fullname }}
                            </option>
                        </select>
                    </div>
                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between mt-4">
                        <button @click="closeChooseProfessionals" class="btn btn-danger ms-auto">Close</button>
                        <button @click="finalBookingService" class="btn btn-success ms-auto">Confirm</button>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            searchQuery: {
                serviceName: '',
                timeRequired: ''
            },
            searchResults: [],
            searched: false,
            services_list : [],
            showServiceDetails : false,
            showProfessionalDetails : false,
            service:{
                service_name:'',
                service_description:'',
                service_time_required:'',
                service_base_price:'',
                service_review:'',
            },
            assignedProfessionals:[],
            selectedProfessional:'',
            serviceHistory:[]
        };
    },
    mounted(){
        fetch('/api/getServices')
        .then(response => response.json())
        .then(data =>{
            if(data){
                this.services_list = data;
            }
        })
        let customer_email = localStorage.getItem('Customer_email')
        fetch(`/api/getServiceRequest?email=${customer_email}`)
        .then(response=>response.json())
        .then(data=>{
            this.serviceHistory = data;
        })
    },
    methods: {
        selectService(serviceObject){
            this.service.service_name = serviceObject.service_name
            this.service.service_description = serviceObject.description
            this.service.service_time_required = serviceObject.time_required
            this.service.service_base_price = serviceObject.base_price
            this.service.service_review = serviceObject.review;
            this.showServiceDetails = true;
        },
        close_box(){
            this.showServiceDetails = false;
        },
        chooseProfessional(){
            this.showProfessionalDetails = true;
            fetch(`/api/assignedProfessional?serviceName=${this.service.service_name}`)
            .then(response=>response.json())
            .then(data=>{
                console.log(data)
                this.assignedProfessionals = data;
            })
            
        },
        finalBookingService(){
            let CustomerEmail = localStorage.getItem('Customer_email');
            const formData = new FormData();
            formData.append('choosedProfessional',this.selectedProfessional);
            formData.append('CustomerEmail',CustomerEmail);
            formData.append('service_name',this.service.service_name);
            window.location.reload();
            fetch(`/api/serviceRequest`,{
                    method:'post',
                    body:formData,
                    headers:{
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    alert(data.message);
                }
            })
            fetch(`/api/send_notification`,{
                    method:'post',
                    body:JSON.stringify({
                        choosedProfessional : this.selectedProfessional,
                        service_name : this.service.service_name,
                        userEmail : CustomerEmail
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.sccuess){
                    console.log(data.message)
                }
            })
        },
        closeChooseProfessionals(){
            this.showProfessionalDetails = false;
        },
        debounce(func, delay) {
            let debounceTimer;
            return function(...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, args), delay);
            };
        },
        searchService:function() {
            // Call API with search parameters only if one of the fields is non-empty
            if (this.searchQuery.serviceName || this.searchQuery.timeRequired) {
                const params = new URLSearchParams({
                    serviceName: this.searchQuery.serviceName,
                    timeRequired: this.searchQuery.timeRequired
                }).toString();

                fetch(`/api/searchService?${params}`)
                    .then(response => response.json())
                    .then(data => {
                        this.searchResults = data;
                        this.searched = true;
                    })
                    .catch(error => console.error("Error fetching search results:", error));
            } else {
                this.searchResults = [];
                this.searched = false;
            }
        }
    },
    created() {
        // Apply debounce to the searchService method to prevent frequent API calls
        this.searchService = this.debounce(this.searchService, 300); // Adjust delay as needed
    }
};

const customerStats = {
    template:`
    <div class="user-statistics">
        <h2>Customer Statistics</h2>
        <div class="stats-container">
            <div class="stat-item">
                <h3>Your Balance</h3>
                <p>{{ statistics.current_balance }}</p>
            </div>
            <div class="stat-item">
                <h3>Total Request Made</h3>
                <p>{{ statistics.total_request_made }}</p>
            </div>
            <div class="stat-item">
                <h3>Recent request Service</h3>
                <p>{{ statistics.recent_request_service }}</p>
            </div>
        </div>


        <h3 class="h4 fw-bold text-dark mb-4">Charts</h3>
        <div class="mb-4">
            <canvas ref="serviceRequestStatus"></canvas>
            <canvas ref="Last5daysRequestMade"></canvas>
        </div>
        
        <!-- Optional: Error message -->
        <div v-if="errorMessage" class="text-danger mt-4">{{ errorMessage }}</div>
    </div>
    `,
    data(){
        return{
            statistics: {
                current_balance: 0,
                total_request_made: 0,
                recent_request_service : '',
                recent_request_status: '',
                ServiceRequestStatus: {},
                Last5daysRequestMade : {},
            },
            errorMessage:null
        }
    },
    methods:{
        fetchStatistics() {
            let customer_email = localStorage.getItem('Customer_email')
            try {
                fetch(`/api/user_statistics?email=${customer_email}`, {
                    method: "GET",
                    headers: {
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
                .then(response =>response.json()) 
                .then(data=>{
                    this.statistics.current_balance = data.current_balance;
                    this.statistics.active_customers = data.total_request_made;
                    this.statistics.blocked_customers = data.recent_request_service;
                    this.ServiceRequestStatus = data.ServiceRequestStatus;
                    this.Last5daysRequestMade = data.Last5daysRequestMade;
                    this.renderCharts();
                })
            } catch (error) {
                this.errorMessage = 'Something Went Wrong!!';
            }
        },
        renderCharts() {
            const ctx1 = this.$refs.serviceRequestStatus.getContext("2d");
            const ctx2 = this.$refs.Last5daysRequestMade.getContext("2d");
            new Chart(ctx1, {
                type: "bar",
                data: {
                    labels: Object.keys(this.ServiceRequestStatus),
                    datasets: [
                        {
                            label: "Service Request Status",
                            data: Object.values(this.ServiceRequestStatus),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(75,192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.1)'
                            ],
                            borderWidth: 1
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAscpectRatio: false
                }
            }),
                new Chart(ctx2, {
                    type: "bar",
                    data: {
                        labels: Object.keys(this.Last5daysRequestMade),
                        datasets: [
                            {
                                label: "Last 5 days Request Made by You",
                                data: Object.values(this.Last5daysRequestMade),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)', // Add the colors for bars here if needed
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'                                
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 0.2)', // Add the colors for bars here if needed
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'
                                ],
                                borderWidth: 1
                                
                            }
                        ]
                    },
                options: {
                    responsive: true,
                    maintainAscpectRatio: false
                }                    
            })
        }
    },
    mounted(){
        this.fetchStatistics()
    },
    style: `
    <style>
    canvas {
        max-width: 300;
        height: 400
    }
    </style>
    `

}

const customerNotifications = {
    template:`
        <div>
            <!-- Expanded Box -->
            <div class="container my-4 p-4 bg-light border rounded">
                <h3>Today's Notifications</h3>
                <div v-for="notification in notifications" class="py-4">
                    <p class="lead">From {{ notification.sender }}</p>
                    <p class="lead">{{ notification.message }}</p>
                    <div class="d-flex">
                        <button @click="deleteNotification(notification)" class="btn btn-danger me-2">Delete</button>
                    </div>
                </div>
                <!-- Display when there are no notifications -->
                <div class="py-4" v-if="notifications.length === 0">
                    <p class="lead">There are no notifications till now!</p>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            notifications : [],
        }
    },
    methods:{
        deleteNotification(notification){
            let customerEmail = localStorage.getItem('Customer_email')
            console.log(customerEmail)
            fetch(`/api/deleteNotification`,{
                method:'post',
                body:JSON.stringify({
                    user_email : customerEmail,
                    notificationSender : notification.sender,
                    notificationMessage : notification.message
                }),
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-Token':localStorage.getItem('token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    alert(data.message);
                }
            })
            window.location.reload();
        }
    },
    mounted(){
        let email = localStorage.getItem('Customer_email')
        let name = 'Customer'
        fetch(`/api/getNotifications?email=${email}&name=${name}`, {
            headers: {
                "Authentication-Token" : localStorage.getItem("token")
            }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.sender === ''){
                    
            }else{
                this.notifications = data;
            }
        })
    }

}

// -------------------------------------------------------- PROFESSIONAL APP ---------------------------------------------------- //

const ProfessionalAPP = {
    template:`
    <div>
        <div v-if="this.$store.state.main_app_condition===0">
            <!-- First Navbar -->
            <nav class="navbar navbar-expand-lg bg-light px-4 py-3">
                <div class="container-fluid">
                    <a class="navbar-brand text-danger" href="#">{{ $store.state.title }}</a>
                    
                    <div class="ml-auto">
                        <router-link to="/">
                            <button @click="logout" class="btn btn-outline-dark">
                                Log-out
                            </button>
                        </router-link>
                    </div>
                </div>
            </nav>
            <!-- Second Navbar -->
            <nav class="navbar navbar-expand-lg bg-danger bg-gradient px-4 py-2">
                <div class="container-fluid">
                    <!-- Left side links -->
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link to="/professional/professional_home" class="nav-link text-white">Home</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/professional/professional_search" class="nav-link text-white">Search</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/professional/professional_stats" class="nav-link text-white">Statistics</router-link>
                        </li>
                    </ul>

                    <!-- Right side links -->
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link to="/professional/professional_notify" class="nav-link text-white">Notifications</router-link>
                        </li>
                    </ul>
                </div>
            </nav>
            <!-- Profile Button below navbars -->
            <div class="container-fluid my-3">
                <div class="d-flex justify-content-end">
                    <button class="btn btn-primary" @click="set_main_app_condition(1,0)">
                        Profile
                    </button>
                </div>
            </div>
            <router-view></router-view>
        </div>

        
        <!---------------------------------------------------------------------------------------------------------------------------------->
        <!-------------------------------------------------------- PROFILE SECTION  -------------------------------------------------------->
        <!---------------------------------------------------------------------------------------------------------------------------------->

        <!---------------------------------------------------------------------------------------------------------------------------------->
        <!-------------------------------------------------------- 1ST     SECTION  -------------------------------------------------------->
        <!---------------------------------------------------------------------------------------------------------------------------------->


        <div v-if="this.$store.state.main_app_condition===1">
            <!-- Profile Page -->
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card shadow">
                            <!-- Profile Header -->
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h3 class="mb-0">User Profile</h3>
                                <!-- Edit Button -->
                                <button class="btn btn-outline-light" @click="set_main_app_condition(0,0)">
                                    Go Back
                                </button>
                                <!-- Edit Button -->
                                <button class="btn btn-outline-light" @click="set_main_app_condition(2,0)">
                                    Edit
                                </button>
                            </div>

                            <!-- Profile Body -->
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Full Name:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ professional.fullname }} <!-- Display Name -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Email:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ professional.email }} <!-- Display Email -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Phone:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ professional.phone }} <!-- Display Phone -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Address:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ professional.address }} <!-- Display Address -->
                                    </div>
                                </div>

                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Pincode:</strong>
                                    </div>
                                    <div class="col-md-8">
                                        {{ professional.pincode }} <!-- Display Joining Date -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!---------------------------------------------------------------------------------------------------------------------------------->
        <!-------------------------------------------------------- 2ND     SECTION  -------------------------------------------------------->
        <!---------------------------------------------------------------------------------------------------------------------------------->

        <div v-if="this.$store.state.main_app_condition===2">

            <!-- Edit Profile Page -->
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card shadow">
                            <!-- Edit Profile Header -->
                            <div class="card-header bg-success text-white">
                                <h3 class="mb-0">Edit Profile</h3>
                                <button class="btn btn-outline-light" @click="set_main_app_condition(1,0)">
                                    Go Back
                                </button>
                            </div>

                            <!-- Edit Profile Body -->
                            <div class="card-body">
                                <div class="mb-3">
                                <label for="fullname" class="form-label">Full Name:</label>
                                <input type="text" id="fullname" v-model="professional.fullname" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="phone" class="form-label">Phone:</label>
                                <input type="text" id="phone" v-model="professional.phone" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="address" class="form-label">Address:</label>
                                <input type="text" id="address" v-model="professional.address" class="form-control">
                                </div>

                                <div class="mb-3">
                                <label for="address" class="form-label">Pincode:</label>
                                <input type="text" id="pincode" v-model="professional.pincode" class="form-control">
                                </div>

                                <!-- Save Changes Button -->
                                <button type="submit" @click="edit_profile" class="btn btn-success mt-3 w-100">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    </div>
    `,
    data() {
        return {

            professional:{
                fullname: "",
                email: "",
                password: "",
                phone:"",
                address:"",
                profile_picture:"",
                pincode:"",
            },
            
        }
    },
    methods:{
        logout() {
            fetch("/api/logout")
                .then((res) => {
                    this.$router.push('/');
                    alert("Logged out Successfully!");
                })
                .catch((err) => {
                    alert("Error occured during logging out");
                })
        },
        set_main_app_condition(val1, val2) {
            this.$store.commit('set_main_app_condition', { value1: val1, value2: val2 });
        },
        edit_profile(){
            let email = localStorage.getItem('Professional_email');
            const formData = new FormData();

            formData.append('fullname', this.professional.fullname);
            formData.append('phone', this.professional.phone);
            formData.append('address', this.professional.address);
            formData.append('pincode', this.professional.pincode);
            formData.append('profile_picture', this.professional.profile_picture);
            fetch(`/api/edit_profile_professional?email=${email}`,{
                method:'post',
                body:formData
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.set_main_app_condition(1,0);
                    alert(data.message);
                }
            })
        }
    },
    mounted(){

        let email = localStorage.getItem('Professional_email')
        console.log(email)
        fetch(`/api/getProfessionals?email=${email}`)
        .then(response=>response.json())
        .then(data=>{
            this.professional.fullname = data.fullname;
            this.professional.email = data.email;
            this.professional.phone = data.phone;
            this.professional.address = data.address;
            this.professional.pincode = data.pin_code;
            this.professional.profile_picture = data.profile_picture;
        })

        
        // fetch('/api/getProfessionals')
        // .then(response=>response.json())
        // .then(data=>{
        //     this.Professionals = data;
        // })
    }
}

const ProfessionalHome = {
    template:`
        <div>
            <div class="container my-4 p-4 bg-light border rounded">
                <h3>Today Services</h3>
                <div v-if="todayServices.length > 0" class="py-4">
                    <!-- Loop through each service request -->
                    <div v-for="(service, index) in todayServices" :key="index" class="p-3 mb-3 bg-white border rounded shadow-sm">
                        <h5 class="text-primary">Service Request ID: {{ service.request_id }}</h5>
                        
                        <p class="text-dark mb-2">Service Name: {{ service.service_name }}</p>
                        <p class="text-muted mb-2">Requested by: {{ service.customer_name }}</p>
                        <p class="text-muted mb-2">Requested Date: {{ service.request_date }}</p>
                        
                        <!-- Accept and Reject Buttons -->
                        <div v-if="service.status=='Requested'" class="d-flex justify-content-start mt-3">
                            <button class="btn btn-success me-3" @click="go_to_notify">
                                <i class="bi bi-check-circle"></i> Go to Notifications
                            </button>
                        </div>
                        <div v-else-if="service.status=='In Progress'" class="d-flex justify-content-start mt-3">
                            <button class="btn btn-success me-3">
                                Accepted
                            </button>
                            <button class="btn btn-danger" @click="completed(service)">
                                Completed?
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Message if no services are available -->
                <div v-else class="py-4">
                    <p class="lead text-muted">Till now, there is no service.</p>
                </div>
            </div>

            <!-- Second Box with Title Outside -->
            <div class="container my-4">
                <h3>Closed Services</h3>
                <div v-if="pastServices.length > 0" class="py-4">
                    <!-- Loop through each service request -->
                    <div v-for="(service, index) in pastServices" :key="index" class="p-3 mb-3 bg-white border rounded shadow-sm">
                        <h5 class="text-primary">Service Request ID: {{ service.request_id }}</h5>
                        <p class="text-dark mb-2">Service Name: {{ service.service_name }}</p>
                        <p class="text-muted mb-2">
                            <i class="bi bi-info-circle text-info"></i> Status: <strong>{{ service.status }}</strong>
                        </p>
                        <p class="text-muted mb-2">Requested by: {{ service.user_name }}</p>
                        <p class="text-muted mb-2">Requested Date: {{ service.request_date }}</p>
                        <p class="text-muted mb-2">Completion Date: {{ service.completion_date }}</p>
                    </div>
                </div>

                <!-- Message if no services are available -->
                <div v-else class="py-4">
                    <p class="lead text-muted">Till now, there is no service.</p>
                </div>
            </div>

        </div>
    `,
    data(){
        return{
            todayServices:[],
            pastServices:[],
        }
    },
    methods:{
        set_main_app_condition(val1, val2) {
            this.$store.commit('set_main_app_condition', { value1: val1, value2: val2 });
        },
        completed(service){
            let name='Completed'
            let professional_email = localStorage.getItem('Professional_email')
            window.location.reload();
            fetch(`/api/send_notification`,{
                    method:'post',
                    body:JSON.stringify({
                        name: name,
                        request_id: service.request_id
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
            .then(response=>response.json())
            .then(data=>{
                if(data.sccuess){
                }
            })
            fetch(`/api/completedServiceRequest`,{
                body:JSON.stringify({
                    requestID : service.request_id
                }),
                method:'post',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-Token':localStorage.getItem('token')
                }
            })
            .then(response=>response.json())
            .then(data=>{

            })
            

        },
        go_to_notify(){

        }
    },
    mounted(){
        let professional_email = localStorage.getItem('Professional_email')
        fetch(`/api/getServiceRequest?profEmail=${professional_email}`)
        .then(response=>response.json())
        .then(data=>{
            this.todayServices = data;
        })
        let name = 'past'
        fetch(`/api/getServiceRequest?profEmail=${professional_email}&name=${name}`)
        .then(response=>response.json())
        .then(data=>{
            this.pastServices = data;
        })

    },

}

const ProfessionalSearch = {
    template:`
        <div class="container my-4">
            <div class="d-flex flex-column flex-md-row align-items-center">
                <!-- Service Request ID Input -->
                <select v-model="searchQuery.selectedServiceReq" @change="searchServiceReq" class="form-control rounded-lg ml-3 mb-2 mb-md-0">
                    <option value="" disabled>Select a Service Request</option>
                    <option v-for="req in serviceReq" :key="req.request_id" :value="req.request_id">
                        {{ req.request_id }}
                    </option>
                </select>
                
                <!-- Remarks Input -->
                <input v-model="searchQuery.remarks" @input="searchServiceReq" type="text" 
                        class="form-control rounded-lg ml-3 mb-2 mb-md-0" placeholder="Remarks">

                <!-- Status Input -->
                <input v-model="searchQuery.status" @input="searchServiceReq" type="text" 
                        class="form-control rounded-lg ml-3 mb-2 mb-md-0" placeholder="Status">
            </div>
            
            <!-- Displaying Results -->
            <div v-if="searchResults.length > 0" class="mt-4">
                <h5 class="text-primary">Search Results</h5>
                <div v-for="(serviceReq, index) in searchResults" :key="index" class="p-3 mb-3 bg-white border rounded shadow-sm">
                    <h5 class="text-dark">{{ serviceReq.service_name }}</h5>
                    <p class="text-muted">Customer Name: {{ serviceReq.customer_name }}</p>
                    <p class="text-muted">Status: {{ serviceReq.status }}</p>
                    <button class="btn btn-outline-primary btn-sm mt-3" @click="selectServiceReq(serviceReq)">
                        <i class="bi bi-search"></i> View Details
                    </button>
                </div>
            </div>
            <div v-else-if="searched" class="mt-4">
                <p class="text-muted">No results found for your criteria</p>
            </div>


            <div v-if="showIdVariable" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style="z-index: 1050;">
                <div class="bg-white p-5 rounded shadow-lg" style="max-width: 500px; width: 100%; border-radius: 15px;">
                    
                    <!-- Title Section -->
                    <div class="text-center mb-4">
                        <h5 class="text-primary mb-3">Service Request Details - ID: {{ serviceRequestDetail.request_id }}</h5>
                        <p class="text-muted">Comprehensive Details of the Request</p>
                    </div>
                    
                    <!-- Service Request Details -->
                    <div class="mb-4">
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-wrench-adjustable-circle me-2"></i>Service Name:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.service_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-person-workspace me-2"></i>Professional Name:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.professional_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-person-fill me-2"></i>Customer Name:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.customer_name }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-clipboard-check-fill me-2"></i>Status:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.status }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-calendar-event-fill me-2"></i>Request Date:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.request_date }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-calendar-check-fill me-2"></i>Completion Date:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.completion_date || 'Pending' }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-chat-right-dots-fill me-2"></i>Remarks:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.remarks || 'No remarks available' }}</p>
                        </div>
                        <div class="mb-3">
                            <h6 class="text-secondary"><i class="bi bi-chat-right-dots-fill me-2"></i>Closed:</h6>
                            <p class="text-dark">{{ serviceRequestDetail.closed || 'Not closed Yet' }}</p>
                        </div>
                        
                    </div>

                    <!-- Action Button -->
                    <div class="text-center mt-4">
                        <button @click="close_box" class="btn btn-outline-danger px-4 py-2 rounded-pill">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            searchQuery: {
                selectedServiceReq: '',
                remarks: '',
                status:'',
            },
            searchResults: [],
            searched: false,
            serviceReq : [],
            showIdVariable:false,
            serviceRequestDetail:{
                request_id:'',
                service_id:'',
                service_name:'',
                professional_id:'',
                professional_name:'',
                customer_id:'',
                customer_name:'',
                status:'',
                request_date:'',
                completion_date:'',
                remarks:'',
                closed:'',
            }
        }
    },
    methods:{
        close_box(){
            this.showIdVariable = false;
        },
        debounce(func, delay) {
            let debounceTimer;
            return function(...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, args), delay);
            };
        },
        searchServiceReq:function() {
            // Call API with search parameters only if one of the fields is non-empty
            if (this.searchQuery.selectedServiceReq || this.searchQuery.remarks || this.searchQuery.status ) {
                const params = new URLSearchParams({
                    selectedServiceReq: this.searchQuery.selectedServiceReq,
                    remarks: this.searchQuery.remarks,
                    status: this.searchQuery.status
                }).toString();

                fetch(`/api/searchServiceReq?${params}`)
                    .then(response => response.json())
                    .then(data => {
                        this.searchResults = data;
                        this.searched = true;
                    })
                    .catch(error => console.error("Error fetching search results:", error));
            } else {
                // Clear search results if both fields are empty
                this.searchResults = [];
                this.searched = false;
            }
        },
        selectServiceReq(serviceReq){
            this.serviceRequestDetail.request_id = serviceReq.request_id
            this.serviceRequestDetail.service_id = serviceReq.service_id
            this.serviceRequestDetail.service_name = serviceReq.service_name
            this.serviceRequestDetail.professional_id = serviceReq.professional_id
            this.serviceRequestDetail.professional_name = serviceReq.professional_name;
            this.serviceRequestDetail.customer_id = serviceReq.customer_id;
            this.serviceRequestDetail.customer_name = serviceReq.customer_name;
            this.serviceRequestDetail.status = serviceReq.status;
            this.serviceRequestDetail.request_date = serviceReq.request_date;
            this.serviceRequestDetail.completion_date = serviceReq.completion_date;
            this.serviceRequestDetail.remarks = serviceReq.remarks;
            this.serviceRequestDetail.closed = serviceReq.closed;
            this.showIdVariable = true;
        }
    },
    mounted(){
        fetch('/api/getServiceRequest')
        .then(response => response.json())
        .then(data =>{
            this.serviceReq = data;
        })
    },

}

const ProfessionalStats = {
    template:`
        <div class="user-statistics">
            <h2>Professionals Statistics</h2>
            <div class="stats-container mb-2">
                <div class="stat-item">
                    <h3>Total Revenue Made</h3>
                    <p>{{ statistics.total_revenue }}</p>
                </div>
                <div class="stat-item">
                    <h3>Average Remarks</h3>
                    <p>{{ statistics.average_remarks }}</p>
                </div>
                <div class="stat-item">
                    <h3>Average Ratings</h3>
                    <p>{{ statistics.average_ratings }}</p>
                </div>
            </div>


            <h3 class="h4 fw-bold text-dark mb-4">Charts</h3>
            <div class="mb-4">
                <canvas ref="tasksStats"></canvas>
                <canvas ref="Last5daysContribution"></canvas>
            </div>        
            <!-- Optional: Error message -->
            <div v-if="errorMessage" class="text-danger mt-4">{{ errorMessage }}</div>

        </div>
    `,
    data(){
        return{
            statistics: {
                total_revenue: 0,
                average_remarks: 0,
                average_ratings: 0,
                tasks_stats:{},
                Last5daysContribution:{}
            },
            errorMessage:null
        }
    },
    methods:{
        renderCharts() {
            const ctx1 = this.$refs.tasksStats.getContext("2d");
            const ctx2 = this.$refs.Last5daysContribution.getContext("2d")
            new Chart(ctx1, {
                type: "bar",
                data: {
                    labels: Object.keys(this.statistics.tasks_stats),
                    datasets: [
                        {
                            label: "Service Request Status",
                            data: Object.values(this.statistics.tasks_stats),
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(75,192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.1)'
                            ],
                            borderWidth: 1
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAscpectRatio: false
                }
            })
            new Chart(ctx2, {
                    type: "bar",
                    data: {
                        labels: Object.keys(this.statistics.Last5daysContribution),
                        datasets: [
                            {
                                label: "Last 5 days Request Made by You",
                                data: Object.values(this.statistics.Last5daysContribution),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)', // Add the colors for bars here if needed
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'                                
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 0.2)', // Add the colors for bars here if needed
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'
                                ],
                                borderWidth: 1
                                
                            }
                        ]
                    },
                options: {
                    responsive: true,
                    maintainAscpectRatio: false
                }                    
            })
        },
        fetchStatistics() {
            const prof_email = localStorage.getItem('Professional_email')
            try {
                fetch(`/api/Professional_statistics?email=${prof_email}`,{
                    method: "GET",
                    headers: {
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
                .then(response =>response.json()) 
                .then(data=>{
                    this.statistics.total_revenue = data.total_revenue
                    this.statistics.average_remarks = data.average_remarks
                    this.statistics.average_ratings = data.average_ratings
                    this.statistics.tasks_stats = data.tasks_stats;
                    this.statistics.Last5daysContribution = data.Last5daysContribution;
                    this.statistics.barChartUrl = false;
                    console.log(data.Last5daysContribution);
                    this.renderCharts();
                })
            } catch (error) {
                errorMessage  = 'Something Went Wrong!!';
            }
        }
    },
    mounted(){
        this.fetchStatistics()
    },
    style: `
    <style>
    canvas {
        max-width: 300;
        height: 400
    }
    </style>
    `

}

const ProfessionalNotifications = {
    template: `
        <div>
            <div class="container my-4 p-4 bg-light border rounded">
                <h3>Today's Notifications</h3>
                <div v-for="notification in notifications" :key="notification.sender" class="py-4">
                    <p class="lead">From {{ notification.sender }}</p>
                    <p class="lead">{{ notification.message }}</p>
                    <div class="d-flex">
                        <button @click="acceptNotification(notification)" class="btn btn-success me-2">Accept</button>
                        <button @click="rejectNotification(notification)" class="btn btn-danger">Reject</button>
                    </div>
                </div>
                <div class="py-4" v-if="notifications.length === 0">
                    <p class="lead">There are no notifications till now!</p>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            notifications: [],
        }
    },
    methods: {
        acceptNotification(notification) {
            let name = 'Accept'
            let sender = localStorage.getItem('Professional_email')
            let servReq = 'ServiceRequest'
            if(notification.sender.includes('(user)')){
                fetch(`/api/ServiceNotification`, {
                    method:'post',
                    body:JSON.stringify({
                        service_text : notification.message,
                        name : name,
                        sentBy : notification.sender,
                        sender : sender,
                        serviceReq : servReq
                    }),
                    headers: {
                        'Content-Type':'application/json',
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                })
                fetch(`/api/send_notification?Professional_email=${sender}&sentBy=${notification.sender}&servName=${notification.message}`,{
                        method:'post',
                        body: JSON.stringify({
                            name:name
                        }),
                        headers:{
                            'Content-Type':'application/json',
                            'Authentication-Token':localStorage.getItem('token')
                        }
                    })
                .then(response=>response.json())
                .then(data=>{
                    if(data.sccuess){
                    }
                })
            }else if(notification.sender === 'admin' ){
                fetch(`/api/ServiceNotification`, {
                    method:'post',
                    body:JSON.stringify({
                        service_text : notification.message,
                        name : name,
                        sentBy : notification.sender,
                        sender : sender
                    }),
                    headers: {
                        'Content-Type':'application/json',
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                })
            }
            window.location.reload();
        },
        rejectNotification(notification){
            let name = 'Reject'
            let sender = localStorage.getItem('Professional_email')
            let servReq = 'ServiceRequest'
            if(notification.sender.includes('(user)')){
                fetch(`/api/ServiceNotification`,{
                    method:'post',
                    body:JSON.stringify({
                        service_text : notification.message,
                        name : name,
                        sentBy : notification.sender,
                        sender : sender,
                        serviceReq : servReq
                    }),
                    headers: {
                        'Content-Type':'application/json',
                        "Authentication-Token" : localStorage.getItem("token")
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                })
                fetch(`/api/send_notification?Professional_email=${sender}&sentBy=${notification.sender}&servName=${notification.message}`,{
                    method:'post',
                    body: JSON.stringify({
                        name:name
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                    })
                .then(response=>response.json())
                .then(data=>{
                    if(data.sccuess){
                    }
                })
            }else if(notification.sender === 'admin' ){
                fetch(`/api/ServiceNotification`, {
                    method:'post',
                    body:JSON.stringify({
                        service_text : notification.message,
                        name : name,
                        sentBy : notification.sender,
                        sender : sender
                    }),
                    headers:{
                        'Content-Type':'application/json',
                        'Authentication-Token':localStorage.getItem('token')
                    }
                })
                .then(response=>response.json())
                .then(data=>{
                })
            }
            window.location.reload();
        },
    },
    mounted() {
        let email = localStorage.getItem('Professional_email');
        let name = 'Professional';
        
        fetch(`/api/getNotifications?email=${email}&name=${name}`,
            {
                headers: {
                    "Authentication-Token":localStorage.getItem("token")
                }
            }
        )
            .then(response => response.json())
            .then(data => {
                if(data.sender === ''){
                    
                } else {
                    console.log(data);
                    this.notifications = data;
                }
            })
            .catch(error => {
                console.log("Error fetching notifications:", error);
            });
    }
}

// -------------------------------------------------------- APP FORM PAGES ---------------------------------------------------- //

const App = {
    template: `
        <div>
            <!-------------------------------------------- Navbar ------------------------------------------->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-4">
                <div class="container">
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item">
                            <span class="navbar-brand h2">{{ $store.state.title }}</span>
                        </li>
                        <li class="nav-item ms-5">
                            <button v-if="$store.state.stoken === 1" @click="setSToken(2)" class="btn btn-outline-light">
                                Sign-up
                            </button>
                            <button v-else @click="setSToken(1)" class="btn btn-outline-light">
                                Log-in
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-------------------------------------------- Sign-Up Form ------------------------------------------->
            <div v-if="$store.state.stoken === 2" class="container mt-4 bg-danger text-white rounded px-4 py-4">
                <div class="d-flex justify-content-between mb-3">
                    <button @click='setLToken(1)' class="btn btn-link text-white h4">Customer SIGN-UP</button>
                    <button @click='setLToken(2)' class="btn btn-link text-white h4">Service Professional SIGN-UP</button>
                </div>
                <div class="row">
                    <!-- Column 1 -->
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="Username" v-if="$store.state.ltoken === 1" class="form-label">Customer Fullname:</label>
                            <label for="Username" v-else class="form-label">Service Professional Fullname:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.fullname" type="text" class="form-control" required>
                            <input v-else v-model="professional.fullname" type="text" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label for="Email" v-if="$store.state.ltoken === 1" class="form-label">Customer Email:</label>
                            <label for="Email" v-else class="form-label">Service Professional Email:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.email" type="email" class="form-control" required>
                            <input v-else v-model="professional.email" type="email" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label for="Password" v-if="$store.state.ltoken === 1" class="form-label">Customer Password:</label>
                            <label for="Password" v-else class="form-label">Service Professional Password:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.password" type="password" class="form-control" required>
                            <input v-else v-model="professional.password" type="password" class="form-control" required>
                        </div>
                    </div>

                    <!-- Column 2 -->
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="Phone" v-if="$store.state.ltoken === 1" class="form-label">Customer Phone:</label>
                            <label for="Phone" v-else class="form-label">Service Professional Phone:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.phone" type="number" class="form-control" required>
                            <input v-else v-model="professional.phone" type="number" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label for="Address" v-if="$store.state.ltoken === 1" class="form-label">Customer Address:</label>
                            <label for="Address" v-else class="form-label">Service Professional Address:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.address" type="text" class="form-control" required>
                            <input v-else v-model="professional.address" type="text" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label for="Pincode" v-if="$store.state.ltoken === 1" class="form-label">Customer Pincode:</label>
                            <label for="Pincode" v-else class="form-label">Service Professional Pincode:</label>
                            <input v-if="$store.state.ltoken === 1" v-model="user.pincode" type="number" class="form-control" required>
                            <input v-else v-model="professional.pincode" type="number" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label for="Profile_picture" v-if="$store.state.ltoken === 2" class="form-label">Service Professional Profile_picture:</label>
                            <input @change="handleFileUpload" v-if="$store.state.ltoken === 2" type="file" class="form-control" required>
                        </div>
                    </div>
                    <button v-if="$store.state.ltoken === 1" @click="customer_signupfunc" class="btn btn-dark w-100 mt-4">Sign-up</button>
                    <button v-if="$store.state.ltoken === 2" @click="professional_signupfunc" class="btn btn-dark w-100 mt-4">Sign-up</button>
                </div>
            </div>



            <!-------------------------------------------- Log-In Form ------------------------------------------->
            <div v-else class="container mt-4 bg-danger text-white rounded px-4 py-6">
                <div class="d-flex justify-content-between">
                    <button @click='setLToken(1)' class="btn btn-link text-white h2">Customer Login</button>
                    <button @click='setLToken(2)' class="btn btn-link text-white h2">Service Professional Login</button>
                    <button @click='setLToken(0)' class="btn btn-link text-white h2">Admin Login</button>
                </div>

                <div class="mt-4 mb-3">
                    <label for="Username" v-if="$store.state.ltoken === 1" class="form-label">Customer Email:</label>
                    <label for="Username" v-else-if="$store.state.ltoken === 2" class="form-label">Service Professional Email:</label>
                    <label for="Username" v-else class="form-label">ADMIN Email:</label>
                    <input v-if="$store.state.ltoken === 2" v-model="email" type="email" class="form-control" required>
                    <input v-else v-model="email" type="email" class="form-control" required>
                </div>

                <div class="mb-3">
                    <label for="Password" v-if="$store.state.ltoken === 1" class="form-label">Customer Password:</label>
                    <label for="Password" v-else-if="$store.state.ltoken === 2" class="form-label">Service Professional Password:</label>
                    <label for="Password" v-else class="form-label">ADMIN Password:</label>
                    <input v-if="$store.state.ltoken === 2" v-model="password" type="password" class="form-control" required>
                    <input v-else v-model="password" type="password" class="form-control" required>
                </div>

                <button @click="loginfunc" class="btn btn-dark w-100 mt-4">Log-in</button>
            </div>
        </div>

    `,
    data() {
        return {
            user:{
                fullname:"",
                email:"",
                password:"",
                phone:"",
                address:"",
                pincode:"",
            },
            professional:{
                fullname: "",
                email: "",
                password: "",
                phone:"",
                address:"",
                profile_picture:null,
                pincode:"",
            },
            email: "",
            password: "",
            Customers:[],
            Professionals: [],
            role:'',
        }
    },
    mounted(){
        fetch('/api/getusers')
        .then(response=>response.json())
        .then(data=>{
            this.Customers = data;
        })
        fetch('/api/getProfessionals')
        .then(response=>response.json())
        .then(data=>{
            this.Professionals = data;
        })
    },
    methods: {
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.professional.profile_picture = file;
            } else {
                this.professional.profile_picture = null;
            }
        },
        setLToken(value) {
            this.$store.commit('setLToken', value);
        },
        setSToken(value) {
            this.$store.commit('setSToken', value);
        },
        loginfunc() {
            fetch('/api/authenticate', {
                body: JSON.stringify({ email: this.email, password: this.password }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                this.role = data.role;
                this.token = data.token;
                document.cookie = `Authentication-Token=${this.token}; path=/; secure; httponly;samesite=strict`
                localStorage.setItem("token",this.token)
                if (this.role === 'admin') {
                    this.$router.push('/admin/dashboard');
                } else if (this.role === 'user') {
                    localStorage.setItem('Customer_email', this.email);
                    localStorage.setItem('Customer_password', this.password);
                    this.$router.push('/user/customer_home');
                } else if (this.role === 'professional') {
                    localStorage.setItem('Professional_email', this.email);
                    localStorage.setItem('Professional_password', this.password);
                    this.$router.push('/professional/professional_home');
                } else {
                    alert('Incorrect email or password. Please try again.');
                }
            })
            .catch(error => {
                console.error('Login failed:', error);
                alert('An error occurred. Please try again.');
            });
            
        },
        customer_signupfunc() {
            
            if(this.user.fullname==="" || this.user.email==="" || this.user.password==="" || this.user.phone==="" || this.user.address==="" || this.user.pincode==="" ){
                return alert("All Fields are required!!")
            }
            const formData = new FormData();
            formData.append('fullname',this.user.fullname)
            formData.append('email',this.user.email)
            formData.append('password',this.user.password)
            formData.append('phone',this.user.phone)
            formData.append('address',this.user.address)
            formData.append('pincode',this.user.pincode)
            
            fetch('/api/postCustomers',{
                method: "POST",
                body: formData
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.user.fullname='';
                    this.user.email='';
                    this.user.password='';
                    this.user.phone='';
                    this.user.address='';
                    this.user.pincode='';
                    this.setSToken(1);
                }else{
                    alert('Something Went Wrong!!!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
            alert("You are ready to Login!")
            window.location.reload();
        },
        professional_signupfunc(){
            if(this.professional.fullname==="" || this.professional.email==="" || this.professional.password==="" || this.professional.phone==="" || this.professional.address==="" || this.professional.pincode==="" || this.professional.profile_picture==="" ){
                return alert("All Fields are required!!")
            }
            const formData = new FormData();
            formData.append('fullname',this.professional.fullname)
            formData.append('email',this.professional.email)
            formData.append('password',this.professional.password)
            formData.append('phone',this.professional.phone)
            formData.append('address',this.professional.address)
            formData.append('pincode',this.professional.pincode)
            formData.append('profile_picture',this.professional.profile_picture)
            
            fetch('/api/postProfessionals',{
                method: "POST",
                body: formData,
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.success){
                    this.professional.fullname='';
                    this.professional.email='';
                    this.professional.password='';
                    this.professional.phone="";
                    this.professional.address='';
                    this.professional.pincode='';
                    this.professional.profile_picture=null;
                    this.setSToken(2);
                }else{
                    alert('Something Went Wrong!!!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
            alert("You are ready to Login!")
            window.location.reload();
        }
    }
};

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: App
        },
        {
            path: '/user',
            component: CustomerAPP,
            children: [
                { path: 'customer_home', component: customerHome },
                { path: 'customer_search', component: customerSearch },
                { path: 'customer_stats', component: customerStats },
                { path: 'customer_notify', component: customerNotifications },
                
            ]
        },
        {
            path: '/professional',
            component: ProfessionalAPP,
            children: [
                { path: 'professional_home', component: ProfessionalHome },
                { path: 'professional_search', component: ProfessionalSearch },
                { path: 'professional_stats', component: ProfessionalStats },
                { path: 'professional_notify', component: ProfessionalNotifications },
            ]
        },
        {
            path: '/admin',
            component: AdminDashboard,
            meta: { requiresAdmin: true },
            children: [
                { path: 'dashboard', component: Dashboard },
                { path: 'customers', component: Customers },
                { path: 'professionals', component: Professionals },
                { path: 'services', component: Services },
                { path: 'service_request', component: Service_request },
                { path: 'reviews', component: Reviews }
            ]
        },
        { path: '*', redirect: '/' }
    ]
});

new Vue({
    el: '#app',
    router,
    store,
});