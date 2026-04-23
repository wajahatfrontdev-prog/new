const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const InstructorCourse = require('../models/instructorCourse');
const StudentCourseEnrollment = require('../models/studentCourseEnrollment');
const CommunityPost = require('../models/communityPost');
const Instructor = require('../models/instructor');

dotenv.config();

async function seedClinicalData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const patient = await User.findOne({ email: 'testpatient@gmail.com' });
        const instructorUser = await User.findOne({ email: 'testinstructuctor@gmail.com' });

        if (!patient || !instructorUser) {
            console.log('Required test users (testpatient@gmail.com, testinstructuctor@gmail.com) not found.');
            process.exit(1);
        }

        // Ensure instructor profile exists
        let instructor = await Instructor.findOne({ user: instructorUser._id });
        if (!instructor) {
            instructor = await Instructor.create({ user: instructorUser._id, specialization: 'Clinical Education' });
        }

        // 1. Create Sample Care Plans with Modules and Quizzes
        const programs = [
            {
                instructor: instructor._id,
                title: 'Diabetes Management Essentials',
                caption: 'A comprehensive program for managing Type-2 Diabetes through diet and monitoring.',
                category: 'HealthProgram',
                healthCondition: 'Diabetes',
                image: '', // Use default in UI
                visibility: 'public',
                modules: [
                    {
                        title: 'Week 1: Foundations',
                        lessons: [
                            { title: 'Intro to Insulin', url: 'https://example.com/v1', description: 'Basics of blood sugar management.' },
                            { title: 'Choosing Low-GI Foods', url: 'https://example.com/v2', description: 'What to eat and what to avoid.' }
                        ],
                        quiz: {
                            questions: [
                                { question: 'What does Insulin help regulate?', options: ['Blood Sugar', 'Iron', 'Potassium', 'Calcium'], correctAnswer: 0 },
                                { question: 'Which is a low Glycemic Index (GI) food?', options: ['White Bread', 'Lentils', 'Donuts', 'Soda'], correctAnswer: 1 }
                            ]
                        }
                    }
                ]
            },
            {
                instructor: instructor._id,
                title: 'Hypertension Control Plan',
                caption: 'Learn how to monitor and control your blood pressure through lifestyle changes.',
                category: 'HealthProgram',
                healthCondition: 'Heart Health',
                image: '',
                visibility: 'public',
                modules: [
                    {
                        title: 'Phase 1: Monitoring',
                        lessons: [
                            { title: 'Understanding Blood Pressure', url: 'https://example.com/bp1', description: 'Systolic vs Diastolic measures.' }
                        ],
                        quiz: {
                            questions: [
                                { question: 'What is a normal blood pressure reading?', options: ['180/120', '120/80', '160/100', '150/95'], correctAnswer: 1 }
                            ]
                        }
                    }
                ]
            }
        ];

        console.log('Cleaning old programs and enrollments...');
        await InstructorCourse.deleteMany({ title: { $in: programs.map(p => p.title) } });

        const createdPrograms = await InstructorCourse.insertMany(programs);
        console.log(`Created ${createdPrograms.length} Health Programs with Quizzes.`);

        // 2. Enroll Patient into one program
        await StudentCourseEnrollment.deleteMany({ user: patient._id });
        const enrollment = await StudentCourseEnrollment.create({
            user: patient._id,
            course: createdPrograms[0]._id,
            status: 'active',
            progress: { completedVideos: 0, totalVideos: 2, percent: 0 }
        });
        console.log(`Enrolled testpatient into ${createdPrograms[0].title}`);

        // 3. Create Community Posts
        await CommunityPost.deleteMany({});
        const posts = [
            {
                author: patient._id,
                authorName: patient.name,
                authorRole: patient.role,
                category: 'Diabetes',
                content: 'I just reached my 7-day streak for blood sugar monitoring! Feeling great. Any tips for low-carb snacks?',
                likes: 12,
                replies: 2,
                likedBy: []
            },
            {
                author: instructorUser._id,
                authorName: instructorUser.name,
                authorRole: instructorUser.role,
                isExpert: true,
                category: 'Heart Health',
                content: 'Remember that consistent monitoring is key to preventing hypertension. Stay hydrated!',
                likes: 156,
                replies: 42,
                likedBy: []
            }
        ];
        await CommunityPost.insertMany(posts);
        console.log('Sample Community Posts created.');

        console.log('✅ Clinical data seeding complete with quizzes!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedClinicalData();
