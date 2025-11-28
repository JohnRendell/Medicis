// // sample data for demo
// const patientData = {
//     id: '1234',
//     name: 'Juan Dela Cruz',
//     gender: 'Male',
//     age: 36,
//     dob: '1945-12-12',
//     address: 'Mars',
//     email: 'jdelacruz@gmail.com',
//     phone: '09123456789'
// };

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
const inputSex = document.getElementById('input-sex');
const inputAge = document.getElementById('input-age');
const inputdate_of_birth = document.getElementById('input-date_of_birth');
const inputAddress = document.getElementById('input-address');
const inputEmail = document.getElementById('input-email');
const inputPhone = document.getElementById('input-phone');
const editOverlay = document.getElementById('edit-overlay');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editForm = document.getElementById('edit-form');
const updateInfoBtn = document.getElementById('update-info-btn');

    // Schedule appointment modal elements
    const scheduleApptOverlay = document.getElementById('schedule-appt-overlay');
    const scheduleApptForm = document.getElementById('schedule-appt-form');
    const inputApptDatetime = document.getElementById('input-appt-datetime');
    const inputApptDoctor = document.getElementById('input-appt-doctor');
    const inputApptHospital = document.getElementById('input-appt-hospital');
    const inputApptType = document.getElementById('input-appt-type');
    const inputApptDesc = document.getElementById('input-appt-desc');
    const cancelScheduleBtn = document.getElementById('cancel-schedule-btn');



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


    // Other button alerts
    document.getElementById('pay-bill-btn')?.addEventListener('click', () => alert('Payment feature coming soon!'));
    document.getElementById('download-receipt-btn')?.addEventListener('click', () => alert('Download receipt feature coming soon!'));

function showEditForm() {
    if (!editOverlay) return;

   const d = new Date(patientData.date_of_birth);

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");

    const finalDate = `${year}-${month}-${day}`;

    // Populate the form fields with the existing patient data
    inputName.value = patientData.name || '';
    inputSex.value = patientData.sex || '';
    inputAge.value = patientData.age || '';
    inputdate_of_birth.value = finalDate || '';
    inputAddress.value = patientData.address || '';
    inputEmail.value = patientData.email || '';
    inputPhone.value = patientData.phone || '';


    editOverlay.hidden = false;
    editOverlay.style.display = 'flex';

    setTimeout(() => inputName.focus(), 50);
}

function hideEditForm() {
    if (!editOverlay) return;


    editOverlay.hidden = true;
    editOverlay.style.display = 'none';

    editForm?.reset();
}

updateInfoBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showEditForm();
});


if (editOverlay) {
    editOverlay.addEventListener('click', (e) => {
        if (e.target === editOverlay) hideEditForm();
    });
}

cancelEditBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    hideEditForm();
});

editForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentFormData = {
        name: inputName.value.trim(),
        sex: inputSex.value,
        age: parseInt(inputAge.value),
        date_of_birth: inputdate_of_birth.value,
        address: inputAddress.value.trim(),
        email: inputEmail.value.trim(),
        phone: inputPhone.value.trim(),
    };

    const toCompare = {
        name: patientData.name,
        sex: patientData.sex,
        age: patientData.age,
        date_of_birth: patientData.date_of_birth,
        address: patientData.address,
        email: patientData.email,
        phone: patientData.phone,
    };

    let changesDetected = false;

    for (const key in currentFormData) {
        if (String(currentFormData[key]) !== String(toCompare[key] || '')) {
            changesDetected = true;
        }
    }
    
    if (!changesDetected) {
        alert('No changes detected.');
        hideEditForm();
        return;
    }

    try {
        const response = await fetch('/patients/update-patient-info', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(currentFormData), 
        });

        const res = await response.json();

       if (!res.success) {
            alert(res.message);
            return
        }
        renderPatientInfo(res.patientData)
        hideEditForm();
    } catch (error) {
        console.error('Final Error during fetch or server failure:', error);
        alert(`Error updating patient information: ${error.message}`);
    }
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
