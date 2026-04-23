const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

async function showUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log(users.map(u => ({ name: u.name, email: u.email, role: u.role, id: u._id })));
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
showUsers();
