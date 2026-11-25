const stations = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Erode", "Tirunelveli", "Thoothukudi", "Vellore", "Thanjavur",
    "Dindigul", "Tiruppur", "Karur", "Kanchipuram", "Hosur",
    "Nagercoil", "Cuddalore", "Sivakasi", "Kumbakonam", "Ramanathapuram"
];

const trainNames = [
    "Vande Bharat Express",
    "Shatabdi Express",
    "Chennai Express",
    "Vaigai Express",
    "Pandian Express",
    "Rockfort Express",
    "Cheran Express",
    "Kovai Express",
    "Nilgiri Express",
    "Mangalore Mail",
    "Pearl City Express",
    "Nellai Express",
    "Anantapuri Express",
    "Pothigai Express",
    "Cholan Express",
    "Uzhavan Express",
    "Guruvayur Express",
    "Kanyakumari Express",
    "Rameswaram Express",
    "Tiruchendur Express"
];

let availableTrains = [];
let selectedTrain = null;

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

function timeToMinutes(time) {
    const parts = time.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
}

function minutesToTime(totalMinutes) {
    totalMinutes = totalMinutes % 1440;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return String(hours).padStart(2, "0") + ":" +
           String(minutes).padStart(2, "0");
}

function generateRouteTrains(from, to) {
    const fromIndex = stations.indexOf(from);
    const toIndex = stations.indexOf(to);

    const distanceFactor = Math.abs(fromIndex - toIndex) + 1;

    const departureTimes = [
        "05:30",
        "07:15",
        "10:00",
        "13:45",
        "18:20",
        "21:40"
    ];

    const durations = [240, 300, 360, 420, 480, 540];

    const options = [];

    for (let i = 0; i < 6; i++) {
        const departure = departureTimes[i];

        const arrival = minutesToTime(
            timeToMinutes(departure) +
            durations[i] +
            (distanceFactor * 8)
        );

        options.push({
            number: String(
                20000 + (fromIndex * 1000) + (toIndex * 6) + i
            ),
            name: trainNames[(fromIndex + toIndex + i) % trainNames.length],
            from: from,
            to: to,
            departure: departure,
            arrival: arrival,
            fare: 180 + (distanceFactor * 45) + (i * 25),
            seats: 12 + ((fromIndex * 7 + toIndex * 3 + i * 9) % 40)
        });
    }

    return options;
}

const journeyDate = document.getElementById("journeyDate");

if (journeyDate) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    journeyDate.min = `${year}-${month}-${day}`;
}

document.getElementById("searchBtn").addEventListener("click", function () {

    const source = document.getElementById("source").value.trim();
    const destination = document.getElementById("destination").value.trim();
    const date = journeyDate.value;
    const results = document.getElementById("trainResults");

    if (source === "" || destination === "" || date === "") {
        results.innerHTML = "<p>Please enter source, destination and journey date.</p>";
        return;
    }

    if (source === destination) {
        results.innerHTML = "<p>Source and destination cannot be the same.</p>";
        return;
    }

    availableTrains = generateRouteTrains(source, destination);

    results.innerHTML = `
        <h3>Available Trains</h3>
        <p class="demo-note">
            6 trains available for your selected route.
            Demo schedules and fares.
        </p>
    `;

    availableTrains.forEach(function (train) {

        results.innerHTML += `
            <div class="train-card">

                <div class="train-info">
                    <h3>${escapeHTML(train.name)}</h3>
                    <span>Train No: ${escapeHTML(train.number)}</span>
                </div>

                <div class="train-route">

                    <div>
                        <h3>${escapeHTML(train.departure)}</h3>
                        <p>${escapeHTML(train.from)}</p>
                    </div>

                    <div class="route-arrow">➜</div>

                    <div>
                        <h3>${escapeHTML(train.arrival)}</h3>
                        <p>${escapeHTML(train.to)}</p>
                    </div>

                </div>

                <div class="train-price">
                    <p>Fare</p>
                    <h3>₹${train.fare}</h3>
                    <p>${train.seats} seats available</p>
                </div>

                <button class="book-btn"
                    onclick="bookTrain('${train.number}')">
                    Book Ticket
                </button>

            </div>
        `;
    });
});

function bookTrain(trainNumber) {

    selectedTrain = availableTrains.find(function (train) {
        return train.number === trainNumber;
    });

    if (!selectedTrain) {
        alert("Train not found.");
        return;
    }

    if (!journeyDate.value) {
        alert("Please select a journey date first.");
        return;
    }

    document.getElementById("passengerForm").reset();

    document.getElementById("passengerModal").classList.add("active");
}

function closePassengerForm() {

    document.getElementById("passengerModal").classList.remove("active");

    selectedTrain = null;
}

document.getElementById("passengerForm").addEventListener("submit", function (event) {

    event.preventDefault();

    if (!selectedTrain) {
        alert("Please select a train first.");
        return;
    }

    const passengerName = document.getElementById("passengerName").value.trim();
    const phone = document.getElementById("passengerPhone").value.trim();
    const age = document.getElementById("passengerAge").value;
    const gender = document.getElementById("passengerGender").value;
    const email = document.getElementById("passengerEmail").value.trim();
    const seat = document.getElementById("seatPreference").value;

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const pnr = "RC" + Math.floor(100000 + Math.random() * 900000);

    const booking = {
        pnr: pnr,
        passenger: passengerName,
        phone: phone,
        age: age,
        gender: gender,
        email: email,
        seat: seat,
        trainNumber: selectedTrain.number,
        trainName: selectedTrain.name,
        from: selectedTrain.from,
        to: selectedTrain.to,
        date: journeyDate.value,
        departure: selectedTrain.departure,
        arrival: selectedTrain.arrival,
        fare: selectedTrain.fare,
        bookingTime: new Date().toLocaleString()
    };

    let bookings = JSON.parse(localStorage.getItem("railBookings")) || [];

    bookings.push(booking);

    localStorage.setItem("railBookings", JSON.stringify(bookings));

    document.getElementById("passengerModal").classList.remove("active");

    loadBookings();

    alert("Booking successful!\nYour PNR is: " + pnr);

    document.getElementById("passengerForm").reset();

    selectedTrain = null;
});

function loadBookings() {

    const bookingList = document.getElementById("bookingList");

    if (!bookingList) {
        return;
    }

    const bookings = JSON.parse(localStorage.getItem("railBookings")) || [];

    if (bookings.length === 0) {
        bookingList.innerHTML = "<p>No bookings found.</p>";
        return;
    }

    bookingList.innerHTML = "";

    bookings.forEach(function (booking) {

        bookingList.innerHTML += `
            <div class="ticket-card" id="ticket-${escapeHTML(booking.pnr)}">

                <div class="ticket-header">
                    <div>
                        <span class="ticket-label">RAILCONNECT E-TICKET</span>
                        <h3>${escapeHTML(booking.trainName)}</h3>
                        <p>Train No. ${escapeHTML(booking.trainNumber)}</p>
                    </div>

                    <span class="ticket-status">CONFIRMED</span>
                </div>

                <div class="ticket-pnr">
                    <span>PNR NUMBER</span>
                    <strong>${escapeHTML(booking.pnr)}</strong>
                </div>

                <div class="ticket-journey">

                    <div class="ticket-station">
                        <span>FROM</span>
                        <h2>${escapeHTML(booking.from)}</h2>
                        <p>${escapeHTML(booking.departure || "--:--")}</p>
                    </div>

                    <div class="ticket-line">───────── →</div>

                    <div class="ticket-station">
                        <span>TO</span>
                        <h2>${escapeHTML(booking.to)}</h2>
                        <p>${escapeHTML(booking.arrival || "--:--")}</p>
                    </div>

                </div>

                <div class="ticket-details">

                    <div>
                        <span>PASSENGER</span>
                        <strong>${escapeHTML(booking.passenger)}</strong>
                    </div>

                    <div>
                        <span>AGE / GENDER</span>
                        <strong>${escapeHTML(booking.age || "N/A")} / ${escapeHTML(booking.gender || "N/A")}</strong>
                    </div>

                    <div>
                        <span>MOBILE</span>
                        <strong>${escapeHTML(booking.phone)}</strong>
                    </div>

                    <div>
                        <span>EMAIL</span>
                        <strong>${escapeHTML(booking.email || "N/A")}</strong>
                    </div>

                    <div>
                        <span>SEAT PREFERENCE</span>
                        <strong>${escapeHTML(booking.seat || "N/A")}</strong>
                    </div>

                    <div>
                        <span>JOURNEY DATE</span>
                        <strong>${escapeHTML(booking.date)}</strong>
                    </div>

                    <div>
                        <span>FARE</span>
                        <strong>₹${booking.fare}</strong>
                    </div>

                    <div>
                        <span>BOOKED ON</span>
                        <strong>${escapeHTML(booking.bookingTime)}</strong>
                    </div>

                </div>

                <div class="ticket-footer">

                    <p>Keep your PNR ready for journey verification.</p>

                    <div class="ticket-actions">

                        <button class="print-btn"
                            onclick="printTicket('${booking.pnr}')">
                            Print / Save PDF
                        </button>

                        <button class="cancel-btn"
                            onclick="cancelBooking('${booking.pnr}')">
                            Cancel Ticket
                        </button>

                    </div>

                </div>

            </div>
        `;
    });
}

function cancelBooking(pnr) {

    if (!confirm("Are you sure you want to cancel this ticket?")) {
        return;
    }

    let bookings = JSON.parse(localStorage.getItem("railBookings")) || [];

    bookings = bookings.filter(function (booking) {
        return booking.pnr !== pnr;
    });

    localStorage.setItem("railBookings", JSON.stringify(bookings));

    alert("Ticket cancelled successfully.");

    loadBookings();
}

function printTicket(pnr) {

    const bookings = JSON.parse(localStorage.getItem("railBookings")) || [];

    const booking = bookings.find(function (item) {
        return item.pnr === pnr;
    });

    if (!booking) {
        alert("Ticket not found.");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups to print your ticket.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>

            <title>RailConnect Ticket - ${escapeHTML(booking.pnr)}</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #1e293b;
                }

                .ticket {
                    max-width: 700px;
                    margin: auto;
                    border: 1px solid #cbd5e1;
                    border-radius: 15px;
                    overflow: hidden;
                }

                .header {
                    background: #0b1f3a;
                    color: white;
                    padding: 25px;
                }

                .header h2 {
                    margin-top: 10px;
                }

                .pnr {
                    margin: 25px;
                    padding: 20px;
                    background: #eff8ff;
                    border: 1px dashed #8ecae6;
                    display: flex;
                    justify-content: space-between;
                }

                .journey {
                    display: flex;
                    justify-content: space-between;
                    padding: 25px;
                }

                .details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 25px;
                    border-top: 1px dashed #ccc;
                    padding-top: 25px;
                }

                .details div {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                span {
                    color: #64748b;
                    font-size: 12px;
                }

                .footer {
                    background: #f1f5f9;
                    padding: 20px;
                }

                @media print {
                    body {
                        padding: 0;
                    }
                }

            </style>

        </head>

        <body>

            <div class="ticket">

                <div class="header">
                    <span>RAILCONNECT E-TICKET</span>
                    <h2>${escapeHTML(booking.trainName)}</h2>
                    <p>Train No. ${escapeHTML(booking.trainNumber)}</p>
                </div>

                <div class="pnr">
                    <span>PNR NUMBER</span>
                    <strong>${escapeHTML(booking.pnr)}</strong>
                </div>

                <div class="journey">

                    <div>
                        <span>FROM</span>
                        <h2>${escapeHTML(booking.from)}</h2>
                        <p>${escapeHTML(booking.departure || "--:--")}</p>
                    </div>

                    <div>
                        <span>TO</span>
                        <h2>${escapeHTML(booking.to)}</h2>
                        <p>${escapeHTML(booking.arrival || "--:--")}</p>
                    </div>

                </div>

                <div class="details">

                    <div>
                        <span>Passenger</span>
                        <strong>${escapeHTML(booking.passenger)}</strong>
                    </div>

                    <div>
                        <span>Age / Gender</span>
                        <strong>${escapeHTML(booking.age || "N/A")} / ${escapeHTML(booking.gender || "N/A")}</strong>
                    </div>

                    <div>
                        <span>Mobile</span>
                        <strong>${escapeHTML(booking.phone)}</strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>${escapeHTML(booking.email || "N/A")}</strong>
                    </div>

                    <div>
                        <span>Seat Preference</span>
                        <strong>${escapeHTML(booking.seat || "N/A")}</strong>
                    </div>

                    <div>
                        <span>Journey Date</span>
                        <strong>${escapeHTML(booking.date)}</strong>
                    </div>

                    <div>
                        <span>Fare</span>
                        <strong>₹${booking.fare}</strong>
                    </div>

                    <div>
                        <span>Booked On</span>
                        <strong>${escapeHTML(booking.bookingTime)}</strong>
                    </div>

                </div>

                <div class="footer">
                    Demo ticket generated by RailConnect.
                </div>

            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `);

    printWindow.document.close();
}

loadBookings();