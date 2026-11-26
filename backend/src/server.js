require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require('./routes/rideRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use('/api/auth', authRoutes);
app.use("/api/drivers", driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => {
  res.send('Carpool API is running');
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }
};

startServer();
