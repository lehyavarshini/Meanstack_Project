const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 9000;

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/HMS27';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define patient schema
const patientSchema = new mongoose.Schema({
    id: Number,
    firstName: String,
    lastName: String,
    dob: Date,
    disease: String,
    gender: String,
    email: String,
    phone: String,
    address: String,
    noofvisits: { type: Number, default: 1 },
    doctorId: String
});

// Define doctor schema
const doctorSchema = new mongoose.Schema({
    id: Number,
    firstName: String,
    lastName:String,
    dob:Date,
    gender:String,
    email:String,
    phone:Number,
    address:String,
    specialization: String
});

// Create models from schemas
const Patient = mongoose.model('Patient', patientSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

// ID Generator class
class IDGenerator {
    constructor() {
        this.counter = 0;
    }

    generateID() {
        return this.counter++;
    }
}

const idGenerator = new IDGenerator();

app.use(express.static('public'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Route to render the add patient form
app.get('/add-patients', (req, res) => {
    res.render('patientForm');
});
/*function mapDiseaseToDoctorId(disease) {
    switch (disease) {
        case 'fever':
            return '6'; 
        case 'cold':
            return '6'; 
        case 'infection':
            return '6'; 
        case 'teeth pain':
            return '0';
        case 'skin disease':
            return '5';
        case 'heart attack':
            return '3';
        case 'skin problem':
            return '1';
        case 'pergency':
            return '4';
        default:
            return null;
    }
}*/

// Route to handle the submission of patient details
app.post('/add-patient', async (req, res) => {
    try {
        const newPatient = new Patient({
            id: idGenerator.generateID(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            disease: req.body.disease,
            //doctorId: mapDiseaseToDoctorId(req.body.disease)
        });
        await newPatient.save();
        res.redirect(`/patientsdetails/success?firstName=${req.body.firstName}&lastName=${req.body.lastName}`); // Redirect to success page with patient's name
    } catch (error) {
        console.error('Error adding patient details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the success page after adding patient details
app.get('/patientsdetails/success', (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const message = `${firstName} ${lastName} details registered successfully.`;
    res.render('success', { message: message });
});



// Route to render the add doctor form
app.get('/add-doctors', (req, res) => {
    res.render('doctorForm');
});

// Route to handle the submission of doctor details
app.post('/add-doctor', async (req, res) => {
    try {
        const newDoctor = new Doctor({
            id: idGenerator.generateID(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            specialization: req.body.specialization
        });
        await newDoctor.save();
        res.redirect(`/doctorsdetails/success?firstName=${req.body.firstName}&lastName=${req.body.lastName}`); // Redirect to success page with doctor's name
    } catch (error) {
        console.error('Error adding doctor details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the success page after adding doctor details
app.get('/doctorsdetails/success', (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const message = `${firstName} ${lastName} details added successfully.`;
    res.render('success', { message: message });
});

// Route to render the search patient by ID interface
app.get('/patientsdetails', (req, res) => {
    res.render('patientDetails');
});

// Route to handle search patient by ID
app.get('/search-patient', async (req, res) => {
    try {
        const patientId = req.query.id;
        const foundPatient = await Patient.findOne({ id: patientId });
        if (foundPatient) {
            res.render('patients', { patients: [foundPatient] });
        } else {
            res.send('Patient not found.');
        }
    } catch (error) {
        console.error('Error searching patient by ID:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the search doctor by ID interface
app.get('/doctorsdetails', (req, res) => {
    res.render('doctorDetails');
});

// Route to handle search doctor by ID
app.get('/search-doctor', async (req, res) => {
    try {
        const doctorId = req.query.id;
        const foundDoctor = await Doctor.findOne({ id: doctorId });
        if (foundDoctor) {
            res.render('doctors', { doctors: [foundDoctor] });
        } else {
            res.send('Doctor not found.');
        }
    } catch (error) {
        console.error('Error searching doctor by ID:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the search patients by disease interface
app.get('/patientsdisease', (req, res) => {
    res.render('patientsByDisease');
});

// Route to handle search patients by disease
app.get('/patients-disease', async (req, res) => {
    try {
        const disease = req.query.disease;
        const foundPatients = await Patient.find({ disease: disease });

        if (foundPatients && foundPatients.length > 0) {
            // If patients are found, render the disease.ejs view with the patients data
            res.render('disease', { patients: foundPatients });
        } else {
            // If no patients found, render the disease.ejs view with a message
            res.render('disease', { message: 'No patients found with the specified disease.' });
        }
    } catch (error) {
        console.error('Error searching patients by disease:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
