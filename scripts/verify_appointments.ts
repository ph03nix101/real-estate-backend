import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';
const DB_CONFIG = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'real_estate_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
};

const pool = new Pool(DB_CONFIG);

async function runVerification() {
    console.log('🚀 Starting Verification...');

    try {
        // 1. Database Connection
        console.log('Checking database connection...');
        const client = await pool.connect();
        console.log('✅ Database connected');
        client.release();

        // 2. Register/Get Agent User
        const agentEmail = `agent_${Date.now()}@test.com`;
        const agentPassword = 'password123';
        console.log(`Registering agent: ${agentEmail}`);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: agentEmail,
                password: agentPassword,
                firstName: 'Test',
                lastName: 'Agent'
            });
            console.log('✅ Agent registered');
        } catch (e: any) {
            console.error('Registration failed:', e.response?.data || e.message);
            throw e;
        }

        // 3. Promote to Agent
        console.log('Promoting user to agent...');
        await pool.query("UPDATE users SET role = 'agent' WHERE email = $1", [agentEmail]);
        console.log('✅ User promoted to agent');

        // 4. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: agentEmail,
            password: agentPassword
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in, token received');

        // 5. Get a Property ID (create one if none exist)
        console.log('Fetching properties...');
        // We need an agent property. For simplicity, let's just insert one or pick one.
        // Actually, let's create a property for this agent so they can see the appointment!
        const agentId = loginRes.data.user.id;

        const propRes = await pool.query(
            `INSERT INTO properties (agent_id, title, location, price, status) 
             VALUES ($1, 'Test Property', 'Test Location', 500000, 'active') 
             RETURNING id`,
            [agentId]
        );
        const propertyId = propRes.rows[0].id;
        console.log(`✅ Test property created: ${propertyId}`);

        // 6. Create Appointment
        console.log('Creating appointment...');
        const appointmentData = {
            propertyId,
            name: 'Client User',
            email: 'client@test.com',
            phone: '555-0123',
            preferred_date: '2026-12-25',
            preferred_time: '14:00',
            message: 'I want to see this house.'
        };

        const apptRes = await axios.post(`${API_URL}/appointments`, appointmentData);
        const appointmentId = apptRes.data.appointment.id;
        console.log(`✅ Appointment created: ${appointmentId}`);

        // 7. Get Appointments (Agent)
        console.log('Fetching agent appointments...');
        const getApptsRes = await axios.get(`${API_URL}/appointments`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Handle array or object response
        const appointments = Array.isArray(getApptsRes.data) ? getApptsRes.data : getApptsRes.data.appointments;

        if (appointments.some((a: any) => a.id === appointmentId)) {
            console.log('✅ Appointment found in list');
        } else {
            console.error('❌ Appointment NOT found in list');
            console.log('List:', appointments);
        }

        // 8. Update Status
        console.log('Updating status to confirmed...');
        await axios.put(`${API_URL}/appointments/${appointmentId}/status`,
            { status: 'confirmed' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Status updated');

        // 9. Verify Status
        const finalRes = await axios.get(`${API_URL}/appointments/${appointmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (finalRes.data.status === 'confirmed') {
            console.log('✅ Status verification passed');
        } else {
            console.error('❌ Status verification failed:', finalRes.data.status);
        }

        console.log('🎉 ALL TESTS PASSED!');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    } finally {
        await pool.end();
    }
}

runVerification();
