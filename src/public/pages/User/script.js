// sample data for demo
const patientData = {
    id: '1234',
    name: 'Juan Dela Cruz',
    gender: 'Male',
    age: 36,
    dob: '1945-12-12',
    address: 'Mars',
    email: 'jdelacruz@gmail.com',
    phone: '09123456789'
};

let appointmentData = [
    { id: 'APT-010', date: '2025-11-10', time: '09:00 AM', doctor: 'Dr. Maria Reyes', status: 'Completed' },
    { id: 'APT-009', date: '2025-10-18', time: '02:30 PM', doctor: 'Dr. Carlo Santos', status: 'Cancelled' },
    { id: 'APT-008', date: '2025-09-05', time: '11:15 AM', doctor: 'Dr. Smith', status: 'Completed' }
];

const billingData = [
    { date: '2025-11-10', description: 'General Checkup', provider: 'Metro Hospital', amount: 2500, status: 'Paid' },
    { date: '2025-10-18', description: 'Blood Test', provider: 'City Lab Center', amount: 3200, status: 'Paid' },
    { date: '2025-09-05', description: 'Cardiology Consultation', provider: 'Heart Care Clinic', amount: 4000, status: 'Pending' },
    { date: '2025-08-15', description: 'X-ray Imaging', provider: 'Radiology Services', amount: 2800, status: 'Pending' }
];

document.addEventListener('DOMContentLoaded', () => {

    // ELEMENTS
    const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
    const pages = Array.from(document.querySelectorAll('.page'));
    
    const inputName = document.getElementById('input-name');
    const inputGender = document.getElementById('input-gender');
    const inputAge = document.getElementById('input-age');
    const inputDob = document.getElementById('input-dob');
    const inputAddress = document.getElementById('input-address');
    const inputEmail = document.getElementById('input-email');
    const inputPhone = document.getElementById('input-phone');

    // Schedule appointment modal elements
    const scheduleApptOverlay = document.getElementById('schedule-appt-overlay');
    const scheduleApptForm = document.getElementById('schedule-appt-form');
    const inputApptDatetime = document.getElementById('input-appt-datetime');
    const inputApptDoctor = document.getElementById('input-appt-doctor');
    const inputApptHospital = document.getElementById('input-appt-hospital');
    const inputApptType = document.getElementById('input-appt-type');
    const inputApptDesc = document.getElementById('input-appt-desc');
    const cancelScheduleBtn = document.getElementById('cancel-schedule-btn');

    // Edit patient information modal elements
    const editOverlay = document.getElementById('edit-overlay');
    const editForm = document.getElementById('edit-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Explicitly hide modals on page load to prevent auto open
    if (scheduleApptOverlay) {
        scheduleApptOverlay.hidden = true;
        scheduleApptOverlay.style.display = 'none';
    }
    if (editOverlay) {
        editOverlay.hidden = true;
        editOverlay.style.display = 'none';
    }

    // ===== NAV =====
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.getAttribute('data-page');
            navButtons.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(pageName)?.classList.add('active');
        });
    });

    // ===== RENDER HELPERS =====
    function formatDateDisplay(isoOrDate) {
        if (!isoOrDate) return '';
        const d = new Date(isoOrDate);
        if (isNaN(d)) return isoOrDate;
        return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
    }

    function renderPatientInfo() {
        document.getElementById('patient-name-header').textContent = (patientData.name || '').toUpperCase();
        document.getElementById('patient-id-header').textContent = patientData.id || '';
        document.getElementById('patient-id-display') && (document.getElementById('patient-id-display').textContent = patientData.id || '');
        document.getElementById('info-name') && (document.getElementById('info-name').textContent = patientData.name || '');
        document.getElementById('info-id') && (document.getElementById('info-id').textContent = patientData.id || '');
        document.getElementById('info-gender') && (document.getElementById('info-gender').textContent = patientData.gender || '');
        document.getElementById('info-age') && (document.getElementById('info-age').textContent = patientData.age ?? '');
        
        if (document.getElementById('info-dob')) {
            const dob = patientData.dob || '';
            if (/^\d{4}-\d{2}-\d{2}/.test(dob)) {
                const d = new Date(dob);
                document.getElementById('info-dob').textContent = isNaN(d) ? dob : `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
            } else {
                document.getElementById('info-dob').textContent = dob;
            }
        }
        
        document.getElementById('info-address') && (document.getElementById('info-address').textContent = patientData.address || '');
        document.getElementById('info-email') && (document.getElementById('info-email').textContent = patientData.email || '');
        document.getElementById('info-phone') && (document.getElementById('info-phone').textContent = patientData.phone || '');

        const apptName = document.getElementById('appt-user-name'); if (apptName) apptName.textContent = patientData.name || '';
        const billingName = document.getElementById('billing-user-name'); if (billingName) billingName.textContent = patientData.name || '';
    }

    function renderAppointments() {
        const tbody = document.getElementById('appointments-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        appointmentData.forEach(a => {
            const tr = document.createElement('tr');
            let displayDate = a.date || '';
            let displayTime = a.time || '';
            
            if (a.date && a.date.includes('T')) {
                const d = new Date(a.date);
                if (!isNaN(d)) {
                    displayDate = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
                    displayTime = displayTime || d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            } else {
                displayDate = formatDateDisplay(a.date);
            }

            const lower = (a.status || '').toLowerCase();
            const statusClass = lower === 'completed' ? 'status completed' : lower === 'pending' ? 'status-pending' : 'status';

            tr.innerHTML = `
                <td>${a.id}</td>
                <td>${displayDate}</td>
                <td>${displayTime}</td>
                <td>${a.doctor || ''}</td>
                <td><span class="${statusClass}">${a.status || ''}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // NEW: render top "upcoming appointments" area (shows next 3 future appts)
    function renderUpcomingAppointments() {
        const datesContainer = document.querySelector('.appointment-dates');
        if (!datesContainer) return;
        datesContainer.innerHTML = '';

        const now = new Date();

        const upcoming = appointmentData
            .map(a => {
                const d = a.date ? new Date(a.date) : null;
                return { a, d };
            })
            .filter(x => x.d && !isNaN(x.d) && x.d >= now)
            .sort((x, y) => x.d - y.d)
            .slice(0, 3);

        if (upcoming.length === 0) {
            const noItem = document.createElement('div');
            noItem.className = 'date-item';
            noItem.textContent = 'No upcoming appointments';
            datesContainer.appendChild(noItem);
            return;
        }

        upcoming.forEach(item => {
            const div = document.createElement('div');
            div.className = 'date-item';
            
            const formattedDate = formatDateDisplay(item.d);
            const formattedTime = item.d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const doctor = item.a.doctor || 'TBD';
            const hospital = item.a.hospital || 'TBD';
            
            div.innerHTML = `
                <span class="date-icon">📅</span>
                <div>${formattedDate}</div>
                <div>⏰ ${formattedTime}</div>
                <div><strong>Dr:</strong> ${doctor}</div>
                <div><strong>Hospital:</strong> ${hospital}</div>
            `;
            datesContainer.appendChild(div);
        });
    }

    function renderBilling() {
        const tbody = document.getElementById('billing-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        billingData.forEach(b => {
            const tr = document.createElement('tr');
            const statusClass = (b.status || '').toLowerCase() === 'paid' ? 'status-paid' : 'status-pending';
            tr.innerHTML = `
                <td>${formatDateDisplay(b.date)}</td>
                <td>${b.description}</td>
                <td>${b.provider}</td>
                <td>₱${Number(b.amount).toLocaleString()}</td>
                <td><span class="${statusClass}">${b.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Schedule appointment modal show/hide
    function showScheduleApptForm() {
        if (!scheduleApptOverlay) return;
        scheduleApptForm.reset();
        scheduleApptOverlay.hidden = false;
        scheduleApptOverlay.style.display = 'flex';
        setTimeout(() => inputApptDatetime?.focus(), 50);
    }

    function hideScheduleApptForm() {
        if (!scheduleApptOverlay) return;
        scheduleApptOverlay.hidden = true;
        scheduleApptOverlay.style.display = 'none';
        scheduleApptForm.reset();
    }

    // Event listeners for scheduling modal
    document.getElementById('schedule-appt-btn')?.addEventListener('click', e => {
        e.preventDefault();
        showScheduleApptForm();
    });

    cancelScheduleBtn?.addEventListener('click', e => {
        e.preventDefault();
        hideScheduleApptForm();
    });

    // Click outside modal closes it
    scheduleApptOverlay?.addEventListener('click', e => {
        if (e.target === scheduleApptOverlay) {
            hideScheduleApptForm();
        }
    });

    // Escape key closes modal
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && scheduleApptOverlay && !scheduleApptOverlay.hidden) {
            hideScheduleApptForm();
        }
    });

    // Handle scheduling form submission
    scheduleApptForm?.addEventListener('submit', e => {
        e.preventDefault();

        const datetimeValue = inputApptDatetime.value;
        const doctorValue = inputApptDoctor.value.trim();
        const hospitalValue = inputApptHospital.value.trim();
        const appointmentTypeValue = inputApptType.value;
        const descriptionValue = inputApptDesc.value.trim();

        if (!datetimeValue || !doctorValue || !hospitalValue || !appointmentTypeValue || !descriptionValue) {
            alert('Please fill in all required fields.');
            return;
        }

        const apptDate = new Date(datetimeValue);
        if (isNaN(apptDate)) {
            alert('Invalid date/time.');
            return;
        }

        const formattedDate = `${String(apptDate.getMonth() + 1).padStart(2, '0')}/${String(apptDate.getDate()).padStart(2, '0')}/${apptDate.getFullYear()}`;
        const formattedTime = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newApptId = `APT-${String(appointmentData.length + 11).padStart(3, '0')}`;
        appointmentData.unshift({
            id: newApptId,
            date: datetimeValue,
            time: formattedTime,
            doctor: doctorValue,
            hospital: hospitalValue,
            type: appointmentTypeValue,
            description: descriptionValue,
            status: 'Pending'
        });

        renderAppointments();
        renderUpcomingAppointments(); // <-- ensure top panel updates
        hideScheduleApptForm();
        alert('Appointment scheduled successfully!');
    });

    // ===== SIGN OUT =====
    document.querySelectorAll('.signout-top').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('authUser');
            alert('Signed out (demo)');
            window.location.reload();
        });
    });

    // Other button alerts
    document.getElementById('pay-bill-btn')?.addEventListener('click', () => alert('Payment feature coming soon!'));
    document.getElementById('download-receipt-btn')?.addEventListener('click', () => alert('Download receipt feature coming soon!'));

    // Patient Info Modal handling
    function showEditForm() {
        if (!editOverlay) return;
        inputName && (inputName.value = patientData.name || '');
        inputGender && (inputGender.value = patientData.gender || '');
        inputAge && (inputAge.value = patientData.age || '');
        inputDob && (inputDob.value = patientData.dob || '');
        inputAddress && (inputAddress.value = patientData.address || '');
        inputEmail && (inputEmail.value = patientData.email || '');
        inputPhone && (inputPhone.value = patientData.phone || '');
        
        editOverlay.hidden = false;
        editOverlay.style.display = 'flex';
        setTimeout(() => inputName?.focus(), 50);
    }

    function hideEditForm() {
        if (!editOverlay) return;
        editOverlay.hidden = true;
        editOverlay.style.display = 'none';
        editForm?.reset();
    }

    document.getElementById('update-info-btn')?.addEventListener('click', e => {
        e.preventDefault();
        showEditForm();
    });

    cancelEditBtn?.addEventListener('click', e => {
        e.preventDefault();
        hideEditForm();
    });

    if (editOverlay) {
        editOverlay.addEventListener('click', e => {
            if (e.target === editOverlay) hideEditForm();
        });
    }

    editForm?.addEventListener('submit', e => {
        e.preventDefault();
        patientData.name = inputName?.value || patientData.name;
        patientData.gender = inputGender?.value || patientData.gender;
        patientData.age = inputAge?.value || patientData.age;
        patientData.dob = inputDob?.value || patientData.dob;
        patientData.address = inputAddress?.value || patientData.address;
        patientData.email = inputEmail?.value || patientData.email;
        patientData.phone = inputPhone?.value || patientData.phone;
        
        renderPatientInfo();
        hideEditForm();
        alert('Patient information updated successfully!');
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && editOverlay && !editOverlay.hasAttribute('hidden')) {
            hideEditForm();
        }
    });

    // Initial renders
    const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    if (authUser?.name) {
        patientData.name = authUser.name;
        if (authUser.email) patientData.email = authUser.email;
    }

    renderPatientInfo();
    renderAppointments();
    renderBilling();
    renderUpcomingAppointments(); // <-- initial render for top panel

});
