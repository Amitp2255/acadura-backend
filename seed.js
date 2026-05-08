const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

dotenv.config();

const Admin = require('./models/Admin');
const College = require('./models/College');
const Application = require('./models/Application');

const connectDB = require('./config/db');

const colleges = [
  {
    name: 'Vellore Institute of Technology',
    location: { city: 'Vellore', state: 'Tamil Nadu' },
    type: 'Deemed',
    established: 1984,
    affiliation: 'UGC / NAAC A++',
    description: 'VIT is one of India\'s top private engineering universities, renowned for its industry-driven curriculum, world-class infrastructure, and outstanding placement record. The university attracts top recruiters from across the globe.',
    highlights: [
      { label: 'NIRF Ranking', value: '#11' },
      { label: 'Campus Size', value: '372 Acres' },
      { label: 'Students', value: '40,000+' },
      { label: 'Faculty', value: '2,500+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 195000 },
      { name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: 195000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 185000 },
      { name: 'B.Tech Civil Engineering', duration: '4 Years', fees: 175000 },
      { name: 'B.Tech AI & Data Science', duration: '4 Years', fees: 210000 },
    ],
    fees: { min: 175000, max: 210000 },
    placement: { percentage: 92, averagePackage: 850000, highestPackage: 5400000, medianPackage: 650000 },
    recruiters: ['Microsoft', 'Amazon', 'Google', 'Deloitte', 'Wipro', 'TCS', 'Infosys', 'Cognizant', 'Capgemini', 'Accenture'],
    images: { thumbnail: '/data/buildings1.jpg', banner: '/data/buildings1.jpg', gallery: ['/data/buildings1.jpg', '/data/landscape1.jpg'] },
    facilities: ['Smart Classrooms', 'Research Labs', 'Sports Complex', 'Hostel', 'Library', 'Wi-Fi Campus'],
    ranking: 'NIRF #11',
    website: 'https://vit.ac.in',
  },
  {
    name: 'SRM Institute of Science and Technology',
    location: { city: 'Chennai', state: 'Tamil Nadu' },
    type: 'Deemed',
    established: 1985,
    affiliation: 'UGC / NAAC A++',
    description: 'SRMIST is a premier institution known for its academic excellence, innovative research, and strong placement record. With state-of-the-art labs and global collaborations, it prepares students for industry leadership.',
    highlights: [
      { label: 'NIRF Ranking', value: '#19' },
      { label: 'Campus Size', value: '250 Acres' },
      { label: 'Students', value: '52,000+' },
      { label: 'Faculty', value: '3,200+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 250000 },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: 250000 },
      { name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: 225000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 200000 },
    ],
    fees: { min: 200000, max: 250000 },
    placement: { percentage: 89, averagePackage: 780000, highestPackage: 4100000, medianPackage: 600000 },
    recruiters: ['Amazon', 'Flipkart', 'HCL', 'Zoho', 'TCS', 'Infosys', 'IBM', 'L&T', 'Bosch', 'Samsung'],
    images: { thumbnail: '/data/buildings2.jpg', banner: '/data/buildings2.jpg', gallery: ['/data/buildings2.jpg', '/data/landscape2.jpg'] },
    facilities: ['Innovation Lab', 'Library', 'Sports Complex', 'Medical Center', 'Hostel', 'Auditorium'],
    ranking: 'NIRF #19',
    website: 'https://srmist.edu.in',
  },
  {
    name: 'Manipal Institute of Technology',
    location: { city: 'Manipal', state: 'Karnataka' },
    type: 'Deemed',
    established: 1957,
    affiliation: 'Manipal Academy of Higher Education',
    description: 'MIT Manipal is one of India\'s most prestigious engineering colleges, known for its holistic development approach, cutting-edge research, and consistent placement track record with top-tier companies.',
    highlights: [
      { label: 'NIRF Ranking', value: '#7' },
      { label: 'Campus Size', value: '600 Acres' },
      { label: 'Students', value: '28,000+' },
      { label: 'Faculty', value: '1,800+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 320000 },
      { name: 'B.Tech Information Technology', duration: '4 Years', fees: 310000 },
      { name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: 290000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 280000 },
      { name: 'B.Tech Data Science', duration: '4 Years', fees: 340000 },
    ],
    fees: { min: 280000, max: 340000 },
    placement: { percentage: 94, averagePackage: 920000, highestPackage: 6800000, medianPackage: 720000 },
    recruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'JP Morgan', 'Amazon', 'Oracle', 'SAP', 'Adobe', 'VMware', 'Cisco'],
    images: { thumbnail: '/data/buildings3.jpg', banner: '/data/buildings3.jpg', gallery: ['/data/buildings3.jpg', '/data/landscape3.jpg'] },
    facilities: ['Innovation Center', 'Fab Lab', 'Sports Complex', 'Swimming Pool', 'Hostel', 'Library'],
    ranking: 'NIRF #7',
    website: 'https://manipal.edu',
  },
  {
    name: 'BITS Pilani',
    location: { city: 'Pilani', state: 'Rajasthan' },
    type: 'Deemed',
    established: 1964,
    affiliation: 'UGC',
    description: 'BITS Pilani is one of India\'s premier technical institutions, known for its Practice School program, entrepreneurial culture, and alumni network that includes top industry leaders and founders.',
    highlights: [
      { label: 'NIRF Ranking', value: '#25' },
      { label: 'Campus Size', value: '328 Acres' },
      { label: 'Students', value: '15,000+' },
      { label: 'Faculty', value: '600+' },
    ],
    courses: [
      { name: 'B.E. Computer Science', duration: '4 Years', fees: 475000 },
      { name: 'B.E. Electronics & Instrumentation', duration: '4 Years', fees: 475000 },
      { name: 'B.E. Mechanical Engineering', duration: '4 Years', fees: 475000 },
      { name: 'B.E. Chemical Engineering', duration: '4 Years', fees: 475000 },
    ],
    fees: { min: 475000, max: 475000 },
    placement: { percentage: 96, averagePackage: 1250000, highestPackage: 12000000, medianPackage: 950000 },
    recruiters: ['Google', 'Microsoft', 'Apple', 'Goldman Sachs', 'McKinsey', 'Uber', 'Flipkart', 'Samsung', 'Tower Research', 'Sprinklr'],
    images: { thumbnail: '/data/landscape1.jpg', banner: '/data/landscape1.jpg', gallery: ['/data/landscape1.jpg'] },
    facilities: ['Practice School', 'Research Labs', 'Innovation Hub', 'Sports Ground', 'Hostel', 'Library'],
    ranking: 'NIRF #25',
    website: 'https://bits-pilani.ac.in',
  },
  {
    name: 'Thapar Institute of Engineering & Technology',
    location: { city: 'Patiala', state: 'Punjab' },
    type: 'Deemed',
    established: 1956,
    affiliation: 'UGC / NAAC A',
    description: 'Thapar University is a leading institution in North India, known for its strong engineering programs, industry partnerships, and excellent placement record in both IT and core sectors.',
    highlights: [
      { label: 'NIRF Ranking', value: '#30' },
      { label: 'Campus Size', value: '250 Acres' },
      { label: 'Students', value: '10,000+' },
      { label: 'Faculty', value: '450+' },
    ],
    courses: [
      { name: 'B.E. Computer Engineering', duration: '4 Years', fees: 295000 },
      { name: 'B.E. Electronics & Communication', duration: '4 Years', fees: 285000 },
      { name: 'B.E. Mechanical Engineering', duration: '4 Years', fees: 275000 },
      { name: 'B.E. Civil Engineering', duration: '4 Years', fees: 265000 },
    ],
    fees: { min: 265000, max: 295000 },
    placement: { percentage: 88, averagePackage: 820000, highestPackage: 4500000, medianPackage: 640000 },
    recruiters: ['Microsoft', 'Amazon', 'Adobe', 'Samsung', 'Deloitte', 'Goldman Sachs', 'Infosys', 'TCS', 'Wipro', 'Capgemini'],
    images: { thumbnail: '/data/landscape2.jpg', banner: '/data/landscape2.jpg', gallery: ['/data/landscape2.jpg'] },
    facilities: ['Central Library', 'Computer Center', 'Hostel', 'Sports Complex', 'Health Center'],
    ranking: 'NIRF #30',
    website: 'https://thapar.edu',
  },
  {
    name: 'Amity University',
    location: { city: 'Noida', state: 'Uttar Pradesh' },
    type: 'Private',
    established: 2005,
    affiliation: 'UGC / NAAC A+',
    description: 'Amity University is one of India\'s largest private universities offering diverse engineering programs with strong industry connections, international collaborations, and modern campus infrastructure.',
    highlights: [
      { label: 'NIRF Ranking', value: '#35' },
      { label: 'Campus Size', value: '1,000 Acres' },
      { label: 'Students', value: '1,25,000+' },
      { label: 'Faculty', value: '5,000+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 310000 },
      { name: 'B.Tech AI & Machine Learning', duration: '4 Years', fees: 335000 },
      { name: 'B.Tech Electronics', duration: '4 Years', fees: 290000 },
      { name: 'B.Tech Biotechnology', duration: '4 Years', fees: 280000 },
    ],
    fees: { min: 280000, max: 335000 },
    placement: { percentage: 82, averagePackage: 620000, highestPackage: 4200000, medianPackage: 480000 },
    recruiters: ['Cognizant', 'HCL', 'Wipro', 'TCS', 'Infosys', 'IBM', 'Accenture', 'Capgemini', 'Tech Mahindra', 'L&T'],
    images: { thumbnail: '/data/buildings1.jpg', banner: '/data/buildings1.jpg', gallery: ['/data/buildings1.jpg'] },
    facilities: ['International Collaborations', 'Incubation Center', 'Sports Academy', 'Smart Labs', 'Hostel'],
    ranking: 'NIRF #35',
    website: 'https://amity.edu',
  },
  {
    name: 'PES University',
    location: { city: 'Bangalore', state: 'Karnataka' },
    type: 'Private',
    established: 1972,
    affiliation: 'UGC / AICTE',
    description: 'PES University is a top private university in Bangalore\'s tech hub, known for its rigorous academics, startup culture, and proximity to major tech companies that fuel outstanding placement outcomes.',
    highlights: [
      { label: 'NIRF Ranking', value: '#59' },
      { label: 'Campus Size', value: '50 Acres' },
      { label: 'Students', value: '12,000+' },
      { label: 'Faculty', value: '700+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 280000 },
      { name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: 260000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 240000 },
      { name: 'B.Tech Biotechnology', duration: '4 Years', fees: 220000 },
    ],
    fees: { min: 220000, max: 280000 },
    placement: { percentage: 90, averagePackage: 870000, highestPackage: 5600000, medianPackage: 680000 },
    recruiters: ['Google', 'Amazon', 'Microsoft', 'Cisco', 'Oracle', 'SAP', 'Flipkart', 'Samsung', 'Intel', 'Qualcomm'],
    images: { thumbnail: '/data/buildings2.jpg', banner: '/data/buildings2.jpg', gallery: ['/data/buildings2.jpg'] },
    facilities: ['Innovation Lab', 'Research Center', 'Sports Complex', 'Library', 'Hostel', 'Cafeteria'],
    ranking: 'NIRF #59',
    website: 'https://pes.edu',
  },
  {
    name: 'Lovely Professional University',
    location: { city: 'Phagwara', state: 'Punjab' },
    type: 'Private',
    established: 2005,
    affiliation: 'UGC / NAAC A++',
    description: 'LPU is one of India\'s largest single-campus universities with a massive placement cell, diverse course offerings, and a vibrant campus life that prepares students for global careers.',
    highlights: [
      { label: 'NIRF Ranking', value: '#45' },
      { label: 'Campus Size', value: '600 Acres' },
      { label: 'Students', value: '50,000+' },
      { label: 'Faculty', value: '4,500+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 180000 },
      { name: 'B.Tech AI & Robotics', duration: '4 Years', fees: 195000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 160000 },
      { name: 'B.Tech Civil Engineering', duration: '4 Years', fees: 150000 },
    ],
    fees: { min: 150000, max: 195000 },
    placement: { percentage: 85, averagePackage: 580000, highestPackage: 4200000, medianPackage: 450000 },
    recruiters: ['Amazon', 'Flipkart', 'TCS', 'Infosys', 'Wipro', 'HCL', 'Byju\'s', 'Cognizant', 'Accenture', 'Tech Mahindra'],
    images: { thumbnail: '/data/buildings3.jpg', banner: '/data/buildings3.jpg', gallery: ['/data/buildings3.jpg'] },
    facilities: ['Uni Mall', 'Sports Village', 'Technology Park', 'Library', 'Hostel', 'Medical Center'],
    ranking: 'NIRF #45',
    website: 'https://lpu.in',
  },
  {
    name: 'Chandigarh University',
    location: { city: 'Mohali', state: 'Punjab' },
    type: 'Private',
    established: 2012,
    affiliation: 'UGC / NAAC A+',
    description: 'Chandigarh University has rapidly emerged as a top-tier institution with exceptional placement records, modern infrastructure, and a strong focus on innovation and entrepreneurship.',
    highlights: [
      { label: 'NIRF Ranking', value: '#27' },
      { label: 'Campus Size', value: '200 Acres' },
      { label: 'Students', value: '35,000+' },
      { label: 'Faculty', value: '2,800+' },
    ],
    courses: [
      { name: 'B.E. Computer Science', duration: '4 Years', fees: 220000 },
      { name: 'B.E. Information Technology', duration: '4 Years', fees: 210000 },
      { name: 'B.E. Mechanical Engineering', duration: '4 Years', fees: 185000 },
      { name: 'B.E. Electrical Engineering', duration: '4 Years', fees: 175000 },
    ],
    fees: { min: 175000, max: 220000 },
    placement: { percentage: 87, averagePackage: 720000, highestPackage: 5200000, medianPackage: 550000 },
    recruiters: ['Google', 'Amazon', 'Microsoft', 'Deloitte', 'TCS', 'Infosys', 'Samsung', 'Cisco', 'L&T', 'Capgemini'],
    images: { thumbnail: '/data/landscape3.jpg', banner: '/data/landscape3.jpg', gallery: ['/data/landscape3.jpg'] },
    facilities: ['Innovation Lab', 'Research Park', 'Sports Stadium', 'Library', 'Hostel', 'Health Center'],
    ranking: 'NIRF #27',
    website: 'https://cuchd.in',
  },
  {
    name: 'Kalinga Institute of Industrial Technology',
    location: { city: 'Bhubaneswar', state: 'Odisha' },
    type: 'Deemed',
    established: 1992,
    affiliation: 'UGC / NAAC A++',
    description: 'KIIT is a premier institution in Eastern India known for its comprehensive engineering programs, social commitment, and strong industry partnerships that drive excellent placement outcomes.',
    highlights: [
      { label: 'NIRF Ranking', value: '#20' },
      { label: 'Campus Size', value: '400 Acres' },
      { label: 'Students', value: '30,000+' },
      { label: 'Faculty', value: '2,000+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 240000 },
      { name: 'B.Tech Electronics', duration: '4 Years', fees: 230000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 220000 },
      { name: 'B.Tech Civil Engineering', duration: '4 Years', fees: 210000 },
    ],
    fees: { min: 210000, max: 240000 },
    placement: { percentage: 86, averagePackage: 680000, highestPackage: 4400000, medianPackage: 520000 },
    recruiters: ['Amazon', 'Microsoft', 'Deloitte', 'PwC', 'TCS', 'Infosys', 'Wipro', 'HCL', 'Accenture', 'IBM'],
    images: { thumbnail: '/data/landscape1.jpg', banner: '/data/landscape1.jpg', gallery: ['/data/landscape1.jpg'] },
    facilities: ['Central Library', 'Tech Park', 'Sports Complex', 'Hospital', 'Hostel', 'Convention Center'],
    ranking: 'NIRF #20',
    website: 'https://kiit.ac.in',
  },
  {
    name: 'Shiv Nadar University',
    location: { city: 'Greater Noida', state: 'Uttar Pradesh' },
    type: 'Private',
    established: 2011,
    affiliation: 'UGC / NAAC A',
    description: 'Shiv Nadar University combines liberal education with strong engineering fundamentals, founded by HCL\'s Shiv Nadar. Known for its research focus, small class sizes, and premium campus.',
    highlights: [
      { label: 'NIRF Ranking', value: '#52' },
      { label: 'Campus Size', value: '286 Acres' },
      { label: 'Students', value: '4,000+' },
      { label: 'Faculty', value: '250+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 395000 },
      { name: 'B.Tech Electronics & Communication', duration: '4 Years', fees: 395000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 385000 },
      { name: 'B.Tech Data Science', duration: '4 Years', fees: 410000 },
    ],
    fees: { min: 385000, max: 410000 },
    placement: { percentage: 91, averagePackage: 1080000, highestPackage: 6500000, medianPackage: 850000 },
    recruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'JP Morgan', 'Flipkart', 'Samsung', 'Adobe', 'Qualcomm', 'Oracle', 'SAP'],
    images: { thumbnail: '/data/buildings1.jpg', banner: '/data/buildings1.jpg', gallery: ['/data/buildings1.jpg'] },
    facilities: ['Research Labs', 'Innovation Center', 'Art Gallery', 'Sports Complex', 'Hostel', 'Library'],
    ranking: 'NIRF #52',
    website: 'https://snu.edu.in',
  },
  {
    name: 'Symbiosis Institute of Technology',
    location: { city: 'Pune', state: 'Maharashtra' },
    type: 'Deemed',
    established: 2008,
    affiliation: 'Symbiosis International University',
    description: 'SIT Pune combines engineering excellence with Symbiosis\' renowned management ecosystem. Students benefit from cross-disciplinary exposure, international exchange programs, and strong industry connections.',
    highlights: [
      { label: 'NIRF Ranking', value: '#68' },
      { label: 'Campus Size', value: '300 Acres' },
      { label: 'Students', value: '5,000+' },
      { label: 'Faculty', value: '200+' },
    ],
    courses: [
      { name: 'B.Tech Computer Science', duration: '4 Years', fees: 350000 },
      { name: 'B.Tech AI & Machine Learning', duration: '4 Years', fees: 370000 },
      { name: 'B.Tech Electronics & Telecom', duration: '4 Years', fees: 330000 },
      { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 310000 },
    ],
    fees: { min: 310000, max: 370000 },
    placement: { percentage: 88, averagePackage: 760000, highestPackage: 4800000, medianPackage: 580000 },
    recruiters: ['Amazon', 'Flipkart', 'Deloitte', 'Accenture', 'TCS', 'Infosys', 'Persistent', 'Cummins', 'Bajaj Auto', 'Siemens'],
    images: { thumbnail: '/data/buildings2.jpg', banner: '/data/buildings2.jpg', gallery: ['/data/buildings2.jpg'] },
    facilities: ['Digital Library', 'Innovation Lab', 'Sports Arena', 'Cultural Center', 'Hostel', 'Cafeteria'],
    ranking: 'NIRF #68',
    website: 'https://sit.ac.in',
  },
];

// Sample applications for seeding
const sampleApplications = [
  { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@gmail.com', course: 'B.Tech Computer Science', location: 'Delhi', status: 'new' },
  { name: 'Priya Patel', phone: '9812345670', email: 'priya.patel@gmail.com', course: 'B.Tech AI & Data Science', location: 'Mumbai', status: 'contacted' },
  { name: 'Amit Kumar', phone: '9765432100', email: 'amit.k@gmail.com', course: 'B.Tech Electronics', location: 'Bangalore', status: 'enrolled' },
  { name: 'Sneha Reddy', phone: '9654321098', email: 'sneha.r@gmail.com', course: 'B.Tech Computer Science', location: 'Hyderabad', status: 'new' },
  { name: 'Vikram Singh', phone: '9543210987', email: 'vikram.s@gmail.com', course: 'B.Tech Mechanical', location: 'Chandigarh', status: 'contacted' },
  { name: 'Ananya Gupta', phone: '9432109876', email: 'ananya.g@gmail.com', course: 'B.Tech Data Science', location: 'Pune', status: 'new' },
  { name: 'Karthik Iyer', phone: '9321098765', email: 'karthik.i@gmail.com', course: 'B.Tech Computer Science', location: 'Chennai', status: 'enrolled' },
  { name: 'Meera Joshi', phone: '9210987654', email: 'meera.j@gmail.com', course: 'B.Tech Information Technology', location: 'Noida', status: 'new' },
  { name: 'Arjun Nair', phone: '9109876543', email: 'arjun.n@gmail.com', course: 'B.Tech Electronics', location: 'Kochi', status: 'contacted' },
  { name: 'Riya Deshmukh', phone: '9098765432', email: 'riya.d@gmail.com', course: 'B.Tech Civil Engineering', location: 'Nagpur', status: 'new' },
  { name: 'Rohan Mehta', phone: '8987654321', email: 'rohan.m@gmail.com', course: 'B.Tech Computer Science', location: 'Ahmedabad', status: 'new' },
  { name: 'Divya Krishnan', phone: '8876543210', email: 'divya.k@gmail.com', course: 'B.Tech AI & Machine Learning', location: 'Coimbatore', status: 'contacted' },
  { name: 'Saurabh Tiwari', phone: '8765432109', email: 'saurabh.t@gmail.com', course: 'B.Tech Mechanical', location: 'Lucknow', status: 'closed' },
  { name: 'Tanvi Agarwal', phone: '8654321098', email: 'tanvi.a@gmail.com', course: 'B.Tech Computer Science', location: 'Jaipur', status: 'new' },
  { name: 'Aditya Chauhan', phone: '8543210987', email: 'aditya.c@gmail.com', course: 'B.Tech Biotechnology', location: 'Dehradun', status: 'enrolled' },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await College.deleteMany({});
    await Application.deleteMany({});

    console.log('👤 Creating admin user...');
    const rawPassword = process.env.ADMIN_PASSWORD || 'Acadura@2024';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@acadura.com';

    const admin = await Admin.create({
      email: adminEmail,
      password: hashedPassword,
    });
    console.log(`   ✅ Admin created: ${admin.email}`);

    console.log('🏫 Seeding colleges...');
    const createdColleges = [];
    for (let college of colleges) {
      if (!college.slug) {
        college.slug = slugify(college.name, {
          lower: true,
          strict: true,
        });
      }
      const newCollege = await College.create(college);
      createdColleges.push(newCollege);
    }
    console.log(`   ✅ ${createdColleges.length} colleges created`);

    console.log('📝 Seeding sample applications...');
    // Assign some applications to random colleges
    const appsWithColleges = sampleApplications.map((app, i) => ({
      ...app,
      college: i < createdColleges.length ? createdColleges[i % createdColleges.length]._id : null,
    }));
    const createdApps = await Application.insertMany(appsWithColleges);
    console.log(`   ✅ ${createdApps.length} applications created`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📋 Admin Login Credentials:`);
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@acadura.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Acadura@2024'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
