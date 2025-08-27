document.addEventListener('DOMContentLoaded', () => {
    const bookingSection = document.getElementById('booking-section');
    const loginPrompt = document.getElementById('login-prompt');
    const userAppointments = document.getElementById('user-appointments');
    const appointmentsList = document.getElementById('appointments-list');
    const bookNowBtn = document.getElementById('book-now-btn');
    const serviceSelect = document.getElementById('service-select');
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    let selectedTimeSlot = null;

    const servicePrices = {
        reiki: 6500,    // Prices in INR for Razorpay
        coaching: 9500,
        chakra: 8000
    };

    // --- Auth State and UI Updates ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginPrompt.style.display = 'none';
            bookingSection.style.display = 'block';
            userAppointments.style.display = 'block';
            loadAppointments(user.uid);
        } else {
            loginPrompt.style.display = 'block';
            bookingSection.style.display = 'none';
            userAppointments.style.display = 'none';
        }
    });

    const today = new Date().toISOString().split('T')[0];
    datePicker.setAttribute('min', today);
    datePicker.addEventListener('change', generateTimeSlots);

    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        selectedTimeSlot = null;
        const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
        availableTimes.forEach(time => {
            const slot = document.createElement('button');
            slot.textContent = time;
            slot.className = 'p-3 border rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500';
            slot.addEventListener('click', () => {
                if (selectedTimeSlot) {
                    selectedTimeSlot.classList.remove('bg-purple-600', 'text-white');
                }
                slot.classList.add('bg-purple-600', 'text-white');
                selectedTimeSlot = slot;
            });
            timeSlotsContainer.appendChild(slot);
        });
    }

    // --- Handle Booking Submission ---
    bookNowBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to book.");
            return;
        }

        const serviceValue = serviceSelect.value;
        const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
        const price = servicePrices[serviceValue];
        const selectedDate = datePicker.value;

        if (!selectedDate || !selectedTimeSlot) {
            alert('Please select a date and time.');
            return;
        }

        bookNowBtn.disabled = true;
        bookNowBtn.textContent = 'Processing...';

        try {
            // 1. Call our new, secure Netlify Function using a standard fetch request
            const response = await fetch('/.netlify/functions/createRazorpayOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceText: serviceText,
                    price: price,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const order = await response.json();
            const { id: order_id, currency, amount } = order;

            // 2. Configure and open the Razorpay Checkout (this part is the same as before)
            const options = {
                key: "rzp_test_RADptTQpswKjPD", // PASTE YOUR Razorpay Key ID HERE
                amount: amount,
                currency: currency,
                name: "Healing Guru",
                description: serviceText,
                order_id: order_id,
                handler: function (paymentResponse) {
                    // This function runs after a SUCCESSFUL payment
                    saveAppointmentToFirestore(paymentResponse, user, serviceText, selectedDate, selectedTimeSlot.textContent, price);
                },
                prefill: {
                    name: user.displayName || "Valued Customer",
                    email: user.email,
                },
                theme: {
                    color: "#6D28D9"
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment initiation failed:", error);
            alert("Could not initiate payment. Please try again.");
        } finally {
            bookNowBtn.disabled = false;
            bookNowBtn.textContent = 'Confirm Booking';
        }
    });

    // --- Save Appointment to Database after Payment ---
    function saveAppointmentToFirestore(paymentResponse, user, service, date, time, price) {
        const bookingData = {
            userId: user.uid,
            service: service,
            date: date,
            time: time,
            price: price,
            status: 'Paid',
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('appointments').add(bookingData)
            .then(() => {
                alert('Payment successful! Your appointment is confirmed.');
                loadAppointments(user.uid); // Refresh the list
            })
            .catch(err => {
                console.error("Error saving appointment: ", err);
                alert('Payment was successful, but there was an error saving your appointment. Please contact support.');
            });
    }

    // --- Load User's Appointments ---
    function loadAppointments(userId) {
        db.collection('appointments').where('userId', '==', userId).orderBy('createdAt', 'desc').get()
            .then(snapshot => {
                appointmentsList.innerHTML = '';
                if (snapshot.empty) {
                    appointmentsList.innerHTML = '<p class="text-gray-600 text-center">You have no upcoming appointments.</p>';
                    return;
                }
                snapshot.forEach(doc => {
                    const appt = doc.data();
                    const apptElement = document.createElement('div');
                    apptElement.className = 'bg-white p-4 rounded-lg shadow-md flex justify-between items-center';
                    apptElement.innerHTML = `
                            <div>
                                <p class="font-bold text-purple-700">${appt.service}</p>
                                <p class="text-gray-600">${new Date(appt.date).toDateString()} at ${appt.time}</p>
                            </div>
                            <span class="text-sm font-semibold text-green-600">${appt.status}</span>
                            <button data-id="${doc.id}" class="cancel-btn text-red-500 hover:underline ml-4">Cancel</button>
                        `;
                    appointmentsList.appendChild(apptElement);
                });

                document.querySelectorAll('.cancel-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const docId = e.target.dataset.id;
                        if (confirm('Are you sure you want to cancel this appointment?')) {
                            db.collection('appointments').doc(docId).delete().then(() => {
                                alert('Appointment cancelled.');
                                loadAppointments(userId);
                            });
                        }
                    });
                });
            });
    }
});