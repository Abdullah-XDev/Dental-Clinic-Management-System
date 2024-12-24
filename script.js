document.addEventListener('DOMContentLoaded', function() {
    // تعيين حجم صورة الشعار
    const logoImage = document.querySelector('.logo img');
    if (logoImage) {
        logoImage.style.width = '100px';
        logoImage.style.height = '100px';
    }

    // Check if logged in
    if (!localStorage.getItem('loggedIn') && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Update file count if on index page
    if (window.location.href.includes('index.html') || window.location.href.endsWith('/')) {
        updateFileCount();
    }

    // Add click event listeners to grid items
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const moduleName = this.querySelector('h3').textContent;
            if (moduleName === 'مريض جديد') {
                window.location.href = 'new-patient.html';
            } else if (moduleName === 'بحث') {
                window.location.href = 'search.html';
            } 
        });
    });

    // Add active class to current nav item
    const navItems = document.querySelectorAll('.sidebar a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default for all nav items
            
            // Get the icon class to determine which page to navigate to
            const iconClass = this.querySelector('i').classList;
            
            if (iconClass.contains('fa-sign-out-alt')) {
                handleLogout();
            } else if (iconClass.contains('fa-user-plus')) {
                window.location.href = 'new-patient.html';
            } else if (iconClass.contains('fa-search')) {
                window.location.href = 'search.html';
            } else if (iconClass.contains('fa-home')) {
                window.location.href = 'index.html';
            } else if (iconClass.contains('fa-money-bill-wave')) {
                window.location.href = 'payments.html';
            } else if (iconClass.contains('fa-users')) {
                window.location.href = 'users.html';
            } else if (iconClass.contains('fa-cog')) {
                window.location.href = 'settings.html';
            } else if (iconClass.contains('fa-file-invoice-dollar')) {
                window.location.href = 'expenses.html';
            }
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Update patient count if on index page
    updatePatientCount();

    // Handle editing patient if on new-patient page
    if (window.location.href.includes('new-patient.html') && window.location.search.includes('edit=true')) {
        const editingIndex = localStorage.getItem('editingPatientIndex');
        if (editingIndex !== null) {
            const patients = JSON.parse(localStorage.getItem('patients') || '[]');
            const patient = patients[editingIndex];
            if (patient) {
                // Fill form with patient data
                document.getElementById('firstName').value = patient.firstName;
                document.getElementById('lastName').value = patient.lastName;
                document.getElementById('age').value = patient.age;
                document.getElementById('phone').value = patient.phone;
                document.getElementById('address').value = patient.address;
                document.querySelector(`input[name="gender"][value="${patient.gender}"]`).checked = true;
                document.getElementById('treatment').value = patient.treatment;

                // Update form submission handler
                document.getElementById('newPatientForm').onsubmit = function(e) {
                    e.preventDefault();
                    
                    // Update patient data
                    patients[editingIndex] = {
                        firstName: document.getElementById('firstName').value,
                        lastName: document.getElementById('lastName').value,
                        age: document.getElementById('age').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        gender: document.querySelector('input[name="gender"]:checked').value,
                        treatment: document.getElementById('treatment').value,
                        date: patient.date // Keep original date
                    };
                    
                    // Save updated patients array
                    localStorage.setItem('patients', JSON.stringify(patients));
                    localStorage.removeItem('editingPatientIndex');
                    
                    alert('تم تحديث بيانات المريض بنجاح');
                    window.location.href = 'search.html';
                };
            }
        }
    }

    // إدارة المدفوعات
    let payments = JSON.parse(localStorage.getItem('payments')) || [];

    function addPayment(payment) {
        payment.id = Date.now();
        payment.date = new Date().toISOString();
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        updatePaymentsDisplay();
        updatePaymentsCount();
    }

    function updatePaymentsCount() {
        const paymentCount = document.querySelector('.stat-card .count');
        if (paymentCount) {
            paymentCount.textContent = payments.length;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    }

    function updatePaymentsDisplay() {
        const paymentsGrid = document.getElementById('paymentsGrid');
        if (!paymentsGrid) return;

        paymentsGrid.innerHTML = '';
        const sortedPayments = [...payments].reverse();

        sortedPayments.forEach(payment => {
            const card = document.createElement('div');
            card.className = 'payment-card';
            
            const date = new Date(payment.date).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            card.innerHTML = `
                <div class="payment-info">
                    <h3>${payment.patientName}</h3>
                    <p>التاريخ: ${date}</p>
                    <p>نوع الخدمة: ${payment.paymentType}</p>
                    ${payment.insuranceCompany ? `<p>شركة التأمين: ${payment.insuranceCompany}</p>` : ''}
                    <p>المبلغ: ${formatCurrency(payment.amount)}</p>
                    ${payment.notes ? `<p>ملاحظات: ${payment.notes}</p>` : ''}
                </div>
            `;
            paymentsGrid.appendChild(card);
        });
    }

    // إضافة مستمع الأحداث لنموذج المدفوعات
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const paymentData = {
                patientName: document.getElementById('patientName').value,
                paymentType: document.getElementById('paymentType').value,
                amount: parseFloat(document.getElementById('amount').value),
                notes: document.getElementById('notes').value
            };

            // إضافة معلومات التأمين إذا تم اختيار الدفع عن طريق التأمين
            const insuranceFields = document.getElementById('insuranceFields');
            if (insuranceFields && insuranceFields.style.display !== 'none') {
                paymentData.insuranceCompany = document.getElementById('insuranceCompany').value;
                paymentData.policyNumber = document.getElementById('policyNumber').value;
                paymentData.coveragePercentage = document.getElementById('coveragePercentage').value;
            }

            addPayment(paymentData);
            paymentForm.reset();
        });

        // إضافة مستمع لخيارات الدفع
        const paymentOptions = document.querySelectorAll('.payment-option');
        const insuranceFields = document.getElementById('insuranceFields');

        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                if (this.dataset.type === 'insurance') {
                    insuranceFields.style.display = 'block';
                } else {
                    insuranceFields.style.display = 'none';
                }
            });
        });
    }

    // تحديث عرض المدفوعات عند تحميل الصفحة
    updatePaymentsDisplay();
    updatePaymentsCount();
});

function handleLogout() {
    const confirmLogout = confirm('هل أنت متأكد من تسجيل الخروج؟');
    
    if (confirmLogout) {
        sessionStorage.clear();
        localStorage.removeItem('loggedIn');
        window.location.href = 'login.html';
    }
}

function updatePatientCount() {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patientCountElement = document.getElementById('patientCount');
    if (patientCountElement) {
        patientCountElement.textContent = patients.length;
    }
}

function updateFileCount() {
    const files = JSON.parse(localStorage.getItem('files') || '[]');
    const fileCountElement = document.getElementById('fileCount');
    if (fileCountElement) {
        fileCountElement.textContent = files.length;
    }
}
