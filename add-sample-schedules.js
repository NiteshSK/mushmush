const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleSchedules = [
  // Oyster Mushroom Cultivation Training (ID: 1) - 5 days
  {
    trainingProgramId: 1,
    schedules: [
      {
        dayNumber: 1,
        date: new Date('2024-01-15'),
        title: 'Oyster Basic Training',
        description: 'Introduction to oyster mushroom cultivation and basic techniques',
        topics: ['Introduction to Oyster Mushrooms', 'Basic Cultivation Methods', 'Sterilization Techniques'],
        practicalSessions: [{ title: 'Substrate Preparation', description: 'Learn to prepare straw substrate', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Mushroom Biology', description: 'Understanding oyster mushroom life cycle', duration: '1 hour' }],
        learningObjectives: ['Understand oyster mushroom biology', 'Master substrate preparation', 'Learn sterilization techniques'],
        materials: ['Fresh straw', 'Plastic bags', 'Spawn', 'Sterilization equipment'],
        instructor: 'Dr. Rajesh Kumar',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 2,
        date: new Date('2024-01-16'),
        title: 'Spawn Inoculation',
        description: 'Hands-on practice with spawn inoculation techniques',
        topics: ['Spawn Types', 'Inoculation Methods', 'Contamination Control'],
        practicalSessions: [{ title: 'Spawn Inoculation', description: 'Practice inoculating substrate bags', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Contamination Prevention', description: 'Identifying and preventing contamination', duration: '1 hour' }],
        learningObjectives: ['Master spawn inoculation', 'Understand contamination control', 'Identify different spawn types'],
        materials: ['Oyster mushroom spawn', 'Inoculation tools', 'Alcohol', 'Gloves'],
        instructor: 'Dr. Rajesh Kumar',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 3,
        date: new Date('2024-01-17'),
        title: 'Incubation Management',
        description: 'Managing incubation conditions for optimal growth',
        topics: ['Temperature Control', 'Humidity Management', 'Monitoring Growth'],
        practicalSessions: [{ title: 'Incubation Setup', description: 'Setting up incubation chambers', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Environmental Control', description: 'Understanding growth parameters', duration: '2 hours' }],
        learningObjectives: ['Set up incubation chambers', 'Control environmental conditions', 'Monitor mushroom growth'],
        materials: ['Thermometer', 'Hygrometer', 'Humidifier', 'Incubation chambers'],
        instructor: 'Dr. Priya Sharma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 4,
        date: new Date('2024-01-18'),
        title: 'Fruiting Chamber Setup',
        description: 'Setting up and managing fruiting chambers',
        topics: ['Fruiting Chamber Design', 'Environmental Control', 'Harvesting Techniques'],
        practicalSessions: [{ title: 'Chamber Setup', description: 'Building fruiting chambers', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Fruiting Conditions', description: 'Optimal conditions for fruiting', duration: '1 hour' }],
        learningObjectives: ['Build fruiting chambers', 'Control fruiting conditions', 'Learn harvesting techniques'],
        materials: ['Plastic sheets', 'Spray bottles', 'Shelving units', 'Lighting equipment'],
        instructor: 'Dr. Priya Sharma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 5,
        date: new Date('2024-01-19'),
        title: 'Harvesting and Post-Harvest',
        description: 'Harvesting techniques and post-harvest management',
        topics: ['Harvesting Methods', 'Post-Harvest Handling', 'Quality Control'],
        practicalSessions: [{ title: 'Harvest Practice', description: 'Harvesting mature mushrooms', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Post-Harvest Management', description: 'Storage and packaging', duration: '2 hours' }],
        learningObjectives: ['Master harvesting techniques', 'Learn post-harvest handling', 'Understand quality control'],
        materials: ['Harvesting knives', 'Storage containers', 'Packaging materials', 'Scale'],
        instructor: 'Dr. Rajesh Kumar',
        startTime: '09:00',
        endTime: '17:00'
      }
    ]
  },
  // Button Mushroom Cultivation Training (ID: 2) - 10 days
  {
    trainingProgramId: 2,
    schedules: [
      {
        dayNumber: 1,
        date: new Date('2024-02-01'),
        title: 'Button Mushroom Introduction',
        description: 'Introduction to button mushroom cultivation fundamentals',
        topics: ['Button Mushroom Varieties', 'Cultivation Overview', 'Market Analysis'],
        practicalSessions: [{ title: 'Compost Analysis', description: 'Analyzing compost quality', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Button Mushroom Biology', description: 'Understanding Agaricus bisporus', duration: '2 hours' }],
        learningObjectives: ['Understand button mushroom varieties', 'Learn cultivation basics', 'Analyze market potential'],
        materials: ['Compost samples', 'Testing kits', 'Reference materials'],
        instructor: 'Dr. Suresh Patel',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 2,
        date: new Date('2024-02-02'),
        title: 'Compost Preparation',
        description: 'Advanced compost preparation techniques',
        topics: ['Compost Formulation', 'Pasteurization', 'Quality Testing'],
        practicalSessions: [{ title: 'Compost Making', description: 'Preparing mushroom compost', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Compost Science', description: 'Understanding compost chemistry', duration: '1 hour' }],
        learningObjectives: ['Master compost preparation', 'Understand pasteurization', 'Test compost quality'],
        materials: ['Raw materials', 'Compost turner', 'Temperature probes', 'Testing equipment'],
        instructor: 'Dr. Suresh Patel',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 3,
        date: new Date('2024-02-03'),
        title: 'Spawning and Casing',
        description: 'Spawning and casing techniques for button mushrooms',
        topics: ['Spawn Types', 'Spawning Methods', 'Casing Soil Preparation'],
        practicalSessions: [{ title: 'Spawning Practice', description: 'Spawning compost beds', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Casing Technology', description: 'Understanding casing layer importance', duration: '1 hour' }],
        learningObjectives: ['Master spawning techniques', 'Prepare casing soil', 'Understand casing importance'],
        materials: ['Button mushroom spawn', 'Casing soil', 'Spawning tools', 'Measuring equipment'],
        instructor: 'Dr. Anita Desai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 4,
        date: new Date('2024-02-04'),
        title: 'Environmental Control',
        description: 'Managing environmental conditions for button mushrooms',
        topics: ['Temperature Management', 'Humidity Control', 'CO2 Management'],
        practicalSessions: [{ title: 'Environmental Setup', description: 'Setting up control systems', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Growth Parameters', description: 'Optimal growth conditions', duration: '2 hours' }],
        learningObjectives: ['Control environmental conditions', 'Manage CO2 levels', 'Monitor growth parameters'],
        materials: ['Environmental controllers', 'Sensors', 'Ventilation equipment', 'Monitoring devices'],
        instructor: 'Dr. Anita Desai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 5,
        date: new Date('2024-02-05'),
        title: 'Pinhead Development',
        description: 'Understanding and managing pinhead development',
        topics: ['Pinhead Formation', 'Development Stages', 'Problem Solving'],
        practicalSessions: [{ title: 'Pinhead Monitoring', description: 'Observing pinhead development', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Development Biology', description: 'Understanding pinhead formation', duration: '2 hours' }],
        learningObjectives: ['Understand pinhead formation', 'Monitor development stages', 'Solve common problems'],
        materials: ['Magnifying glasses', 'Monitoring charts', 'Reference guides'],
        instructor: 'Dr. Suresh Patel',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 6,
        date: new Date('2024-02-06'),
        title: 'Fruiting Management',
        description: 'Managing fruiting body development',
        topics: ['Fruiting Conditions', 'Water Management', 'Disease Control'],
        practicalSessions: [{ title: 'Fruiting Chamber Management', description: 'Managing fruiting conditions', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Disease Prevention', description: 'Common diseases and prevention', duration: '1 hour' }],
        learningObjectives: ['Manage fruiting conditions', 'Control watering', 'Prevent diseases'],
        materials: ['Watering systems', 'Disease control agents', 'Monitoring equipment'],
        instructor: 'Dr. Anita Desai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 7,
        date: new Date('2024-02-07'),
        title: 'Harvesting Techniques',
        description: 'Advanced harvesting techniques for button mushrooms',
        topics: ['Harvest Timing', 'Harvesting Methods', 'Quality Assessment'],
        practicalSessions: [{ title: 'Harvest Practice', description: 'Harvesting mushrooms', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Quality Standards', description: 'Understanding quality parameters', duration: '1 hour' }],
        learningObjectives: ['Master harvesting techniques', 'Assess mushroom quality', 'Time harvests correctly'],
        materials: ['Harvesting knives', 'Collection containers', 'Quality assessment tools'],
        instructor: 'Dr. Suresh Patel',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 8,
        date: new Date('2024-02-08'),
        title: 'Post-Harvest Management',
        description: 'Post-harvest handling and storage techniques',
        topics: ['Storage Methods', 'Packaging', 'Shelf Life Extension'],
        practicalSessions: [{ title: 'Packaging Practice', description: 'Packaging mushrooms', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Post-Harvest Technology', description: 'Extending shelf life', duration: '2 hours' }],
        learningObjectives: ['Learn storage methods', 'Master packaging techniques', 'Extend shelf life'],
        materials: ['Packaging materials', 'Storage containers', 'Preservatives', 'Labeling equipment'],
        instructor: 'Dr. Anita Desai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 9,
        date: new Date('2024-02-09'),
        title: 'Business Management',
        description: 'Business aspects of button mushroom cultivation',
        topics: ['Cost Analysis', 'Market Strategies', 'Business Planning'],
        practicalSessions: [{ title: 'Business Planning', description: 'Creating business plans', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Market Analysis', description: 'Understanding market dynamics', duration: '2 hours' }],
        learningObjectives: ['Analyze costs', 'Develop market strategies', 'Create business plans'],
        materials: ['Business templates', 'Market reports', 'Financial calculators'],
        instructor: 'Dr. Suresh Patel',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 10,
        date: new Date('2024-02-10'),
        title: 'Advanced Techniques',
        description: 'Advanced cultivation techniques and troubleshooting',
        topics: ['Advanced Methods', 'Troubleshooting', 'Future Trends'],
        practicalSessions: [{ title: 'Problem Solving', description: 'Solving cultivation problems', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Future Technologies', description: 'Emerging cultivation methods', duration: '2 hours' }],
        learningObjectives: ['Learn advanced techniques', 'Solve complex problems', 'Understand future trends'],
        materials: ['Advanced equipment', 'Reference materials', 'Case studies'],
        instructor: 'Dr. Anita Desai',
        startTime: '09:00',
        endTime: '17:00'
      }
    ]
  },
  // Shiitake Mushroom Cultivation Training (ID: 3) - 14 days
  {
    trainingProgramId: 3,
    schedules: [
      {
        dayNumber: 1,
        date: new Date('2024-03-01'),
        title: 'Shiitake Mushroom Introduction',
        description: 'Introduction to shiitake mushroom cultivation',
        topics: ['Shiitake Varieties', 'Cultivation Methods', 'Health Benefits'],
        practicalSessions: [{ title: 'Log Selection', description: 'Selecting suitable logs', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Shiitake Biology', description: 'Understanding Lentinula edodes', duration: '2 hours' }],
        learningObjectives: ['Understand shiitake varieties', 'Learn cultivation methods', 'Select suitable logs'],
        materials: ['Different log samples', 'Reference materials', 'Selection tools'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 2,
        date: new Date('2024-03-02'),
        title: 'Log Preparation',
        description: 'Preparing logs for shiitake cultivation',
        topics: ['Log Cutting', 'Seasoning', 'Moisture Content'],
        practicalSessions: [{ title: 'Log Cutting Practice', description: 'Cutting and preparing logs', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Log Preparation Science', description: 'Understanding log preparation', duration: '1 hour' }],
        learningObjectives: ['Master log cutting', 'Understand seasoning process', 'Control moisture content'],
        materials: ['Chainsaws', 'Measuring tools', 'Moisture meter', 'Safety equipment'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 3,
        date: new Date('2024-03-03'),
        title: 'Inoculation Techniques',
        description: 'Inoculation techniques for shiitake mushrooms',
        topics: ['Spawn Types', 'Inoculation Methods', 'Inoculation Timing'],
        practicalSessions: [{ title: 'Inoculation Practice', description: 'Inoculating logs with spawn', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Inoculation Science', description: 'Understanding inoculation process', duration: '1 hour' }],
        learningObjectives: ['Master inoculation techniques', 'Understand spawn types', 'Time inoculation correctly'],
        materials: ['Shiitake spawn', 'Inoculation tools', 'Wax', 'Sealing equipment'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 4,
        date: new Date('2024-03-04'),
        title: 'Incubation Management',
        description: 'Managing incubation of inoculated logs',
        topics: ['Incubation Conditions', 'Monitoring Growth', 'Problem Solving'],
        practicalSessions: [{ title: 'Incubation Setup', description: 'Setting up incubation area', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Incubation Science', description: 'Understanding incubation process', duration: '2 hours' }],
        learningObjectives: ['Set up incubation', 'Monitor growth', 'Solve incubation problems'],
        materials: ['Incubation space setup', 'Monitoring tools', 'Environmental controls'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 5,
        date: new Date('2024-03-05'),
        title: 'Forcing Techniques',
        description: 'Techniques for forcing shiitake fruiting',
        topics: ['Forcing Methods', 'Environmental Control', 'Timing'],
        practicalSessions: [{ title: 'Forcing Practice', description: 'Practicing forcing techniques', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Forcing Science', description: 'Understanding forcing process', duration: '1 hour' }],
        learningObjectives: ['Master forcing techniques', 'Control environment', 'Time forcing correctly'],
        materials: ['Forcing tanks', 'Temperature control', 'Water management equipment'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 6,
        date: new Date('2024-03-06'),
        title: 'Fruiting Management',
        description: 'Managing shiitake fruiting process',
        topics: ['Fruiting Conditions', 'Harvest Timing', 'Quality Control'],
        practicalSessions: [{ title: 'Fruiting Management', description: 'Managing fruiting logs', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Quality Parameters', description: 'Understanding quality standards', duration: '1 hour' }],
        learningObjectives: ['Manage fruiting conditions', 'Time harvests', 'Control quality'],
        materials: ['Fruiting racks', 'Environmental controls', 'Quality assessment tools'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 7,
        date: new Date('2024-03-07'),
        title: 'Harvesting and Post-Harvest',
        description: 'Harvesting and post-harvest management of shiitake',
        topics: ['Harvesting Methods', 'Post-Harvest Handling', 'Storage'],
        practicalSessions: [{ title: 'Harvest Practice', description: 'Harvesting shiitake mushrooms', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Post-Harvest Technology', description: 'Post-harvest handling techniques', duration: '2 hours' }],
        learningObjectives: ['Master harvesting', 'Handle post-harvest', 'Store properly'],
        materials: ['Harvesting tools', 'Storage containers', 'Packaging materials'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 8,
        date: new Date('2024-03-08'),
        title: 'Alternative Substrates',
        description: 'Alternative substrates for shiitake cultivation',
        topics: ['Sawdust Blocks', 'Supplemented Substrates', 'Comparison'],
        practicalSessions: [{ title: 'Substrate Preparation', description: 'Preparing alternative substrates', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Substrate Science', description: 'Understanding substrate alternatives', duration: '1 hour' }],
        learningObjectives: ['Prepare alternative substrates', 'Compare methods', 'Understand substrate science'],
        materials: ['Sawdust', 'Supplements', 'Mixing equipment', 'Containers'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 9,
        date: new Date('2024-03-09'),
        title: 'Disease and Pest Management',
        description: 'Managing diseases and pests in shiitake cultivation',
        topics: ['Common Diseases', 'Pest Identification', 'Control Methods'],
        practicalSessions: [{ title: 'Disease Identification', description: 'Identifying diseases', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Integrated Pest Management', description: 'IPM strategies', duration: '2 hours' }],
        learningObjectives: ['Identify diseases', 'Control pests', 'Implement IPM'],
        materials: ['Disease samples', 'Pest identification guides', 'Control agents'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 10,
        date: new Date('2024-03-10'),
        title: 'Business Planning',
        description: 'Business planning for shiitake cultivation',
        topics: ['Market Analysis', 'Cost Calculation', 'Business Models'],
        practicalSessions: [{ title: 'Business Planning', description: 'Creating business plans', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Market Strategies', description: 'Developing market strategies', duration: '2 hours' }],
        learningObjectives: ['Analyze market', 'Calculate costs', 'Create business models'],
        materials: ['Business templates', 'Market reports', 'Financial tools'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 11,
        date: new Date('2024-03-11'),
        title: 'Advanced Log Cultivation',
        description: 'Advanced techniques in log cultivation',
        topics: ['Advanced Methods', 'Yield Optimization', 'Sustainability'],
        practicalSessions: [{ title: 'Advanced Techniques', description: 'Practicing advanced methods', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Sustainability', description: 'Sustainable cultivation practices', duration: '1 hour' }],
        learningObjectives: ['Learn advanced methods', 'Optimize yield', 'Implement sustainability'],
        materials: ['Advanced equipment', 'Sustainability guides', 'Yield monitoring tools'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 12,
        date: new Date('2024-03-12'),
        title: 'Value Addition',
        description: 'Value addition to shiitake mushrooms',
        topics: ['Processing Methods', 'Product Development', 'Marketing'],
        practicalSessions: [{ title: 'Processing Practice', description: 'Processing shiitake mushrooms', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Product Development', description: 'Developing shiitake products', duration: '2 hours' }],
        learningObjectives: ['Process mushrooms', 'Develop products', 'Market value-added products'],
        materials: ['Processing equipment', 'Packaging materials', 'Product development tools'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 13,
        date: new Date('2024-03-13'),
        title: 'Quality Assurance',
        description: 'Quality assurance in shiitake cultivation',
        topics: ['Quality Standards', 'Testing Methods', 'Certification'],
        practicalSessions: [{ title: 'Quality Testing', description: 'Testing mushroom quality', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Certification Process', description: 'Understanding certification', duration: '2 hours' }],
        learningObjectives: ['Maintain quality', 'Test products', 'Understand certification'],
        materials: ['Testing equipment', 'Quality standards', 'Certification guides'],
        instructor: 'Dr. Meena Reddy',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 14,
        date: new Date('2024-03-14'),
        title: 'Future Trends and Technology',
        description: 'Future trends and technology in shiitake cultivation',
        topics: ['Emerging Technologies', 'Research Trends', 'Industry Future'],
        practicalSessions: [{ title: 'Technology Demo', description: 'Demonstrating new technologies', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Future Outlook', description: 'Industry future trends', duration: '2 hours' }],
        learningObjectives: ['Understand new technologies', 'Follow research trends', 'Plan for future'],
        materials: ['Technology demos', 'Research papers', 'Industry reports'],
        instructor: 'Dr. Kumar Verma',
        startTime: '09:00',
        endTime: '17:00'
      }
    ]
  },
  // Ganoderma (Reishi) Mushroom Cultivation Training (ID: 4) - 14 days
  {
    trainingProgramId: 4,
    schedules: [
      {
        dayNumber: 1,
        date: new Date('2024-04-01'),
        title: 'Reishi Mushroom Introduction',
        description: 'Introduction to Reishi mushroom cultivation and medicinal properties',
        topics: ['Reishi Varieties', 'Medicinal Properties', 'Cultivation Overview'],
        practicalSessions: [{ title: 'Reishi Identification', description: 'Identifying Reishi species', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Medicinal Properties', description: 'Understanding health benefits', duration: '2 hours' }],
        learningObjectives: ['Identify Reishi varieties', 'Understand medicinal properties', 'Learn cultivation basics'],
        materials: ['Reishi samples', 'Reference materials', 'Identification guides'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 2,
        date: new Date('2024-04-02'),
        title: 'Substrate Preparation',
        description: 'Preparing substrates for Reishi cultivation',
        topics: ['Substrate Types', 'Formulation', 'Sterilization'],
        practicalSessions: [{ title: 'Substrate Preparation', description: 'Preparing Reishi substrates', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Substrate Science', description: 'Understanding substrate requirements', duration: '1 hour' }],
        learningObjectives: ['Master substrate preparation', 'Understand formulation', 'Sterilize properly'],
        materials: ['Substrate materials', 'Mixing equipment', 'Sterilization equipment'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 3,
        date: new Date('2024-04-03'),
        title: 'Spawn Production',
        description: 'Producing spawn for Reishi cultivation',
        topics: ['Spawn Types', 'Production Methods', 'Quality Control'],
        practicalSessions: [{ title: 'Spawn Production', description: 'Producing Reishi spawn', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Spawn Quality', description: 'Ensuring spawn quality', duration: '1 hour' }],
        learningObjectives: ['Produce quality spawn', 'Control quality', 'Understand spawn biology'],
        materials: ['Spawn production equipment', 'Quality testing tools', 'Sterilization equipment'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 4,
        date: new Date('2024-04-04'),
        title: 'Inoculation and Incubation',
        description: 'Inoculation and incubation techniques for Reishi',
        topics: ['Inoculation Methods', 'Incubation Conditions', 'Monitoring'],
        practicalSessions: [{ title: 'Inoculation Practice', description: 'Inoculating substrates', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Incubation Management', description: 'Managing incubation', duration: '1 hour' }],
        learningObjectives: ['Master inoculation', 'Manage incubation', 'Monitor growth'],
        materials: ['Inoculation tools', 'Incubation chambers', 'Monitoring equipment'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 5,
        date: new Date('2024-04-05'),
        title: 'Fruiting Body Development',
        description: 'Managing fruiting body development in Reishi',
        topics: ['Fruiting Conditions', 'Environmental Control', 'Development Stages'],
        practicalSessions: [{ title: 'Fruiting Setup', description: 'Setting up fruiting conditions', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Development Biology', description: 'Understanding fruiting development', duration: '2 hours' }],
        learningObjectives: ['Set up fruiting', 'Control environment', 'Understand development'],
        materials: ['Fruiting chambers', 'Environmental controls', 'Monitoring tools'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 6,
        date: new Date('2024-04-06'),
        title: 'Antler Reishi Cultivation',
        description: 'Specialized techniques for antler Reishi cultivation',
        topics: ['Antler Reishi', 'Specialized Techniques', 'Market Value'],
        practicalSessions: [{ title: 'Antler Cultivation', description: 'Practicing antler techniques', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Market Analysis', description: 'Understanding antler Reishi market', duration: '1 hour' }],
        learningObjectives: ['Cultivate antler Reishi', 'Understand specialized techniques', 'Analyze market'],
        materials: ['Specialized equipment', 'Antler Reishi samples', 'Market reports'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 7,
        date: new Date('2024-04-07'),
        title: 'Harvesting and Processing',
        description: 'Harvesting and processing Reishi mushrooms',
        topics: ['Harvest Timing', 'Processing Methods', 'Quality Assessment'],
        practicalSessions: [{ title: 'Harvest Practice', description: 'Harvesting Reishi mushrooms', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Processing Technology', description: 'Processing methods', duration: '2 hours' }],
        learningObjectives: ['Time harvests correctly', 'Process mushrooms', 'Assess quality'],
        materials: ['Harvesting tools', 'Processing equipment', 'Quality assessment tools'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 8,
        date: new Date('2024-04-08'),
        title: 'Extract Production',
        description: 'Producing Reishi extracts and tinctures',
        topics: ['Extraction Methods', 'Tincture Production', 'Quality Control'],
        practicalSessions: [{ title: 'Extract Production', description: 'Producing Reishi extracts', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Extraction Science', description: 'Understanding extraction processes', duration: '1 hour' }],
        learningObjectives: ['Produce extracts', 'Make tinctures', 'Control quality'],
        materials: ['Extraction equipment', 'Alcohol', 'Bottles', 'Labeling materials'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 9,
        date: new Date('2024-04-09'),
        title: 'Medicinal Properties Research',
        description: 'Understanding the medicinal properties and research',
        topics: ['Active Compounds', 'Research Findings', 'Health Applications'],
        practicalSessions: [{ title: 'Literature Review', description: 'Reviewing research papers', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Medicinal Science', description: 'Understanding active compounds', duration: '2 hours' }],
        learningObjectives: ['Understand active compounds', 'Review research', 'Apply knowledge'],
        materials: ['Research papers', 'Reference materials', 'Scientific journals'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 10,
        date: new Date('2024-04-10'),
        title: 'Quality Control and Testing',
        description: 'Quality control and testing for Reishi products',
        topics: ['Quality Standards', 'Testing Methods', 'Certification'],
        practicalSessions: [{ title: 'Quality Testing', description: 'Testing Reishi products', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Certification Process', description: 'Understanding certification', duration: '2 hours' }],
        learningObjectives: ['Maintain quality', 'Test products', 'Understand certification'],
        materials: ['Testing equipment', 'Quality standards', 'Certification guides'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 11,
        date: new Date('2024-04-11'),
        title: 'Business Management',
        description: 'Business management for Reishi cultivation',
        topics: ['Business Planning', 'Cost Analysis', 'Market Strategies'],
        practicalSessions: [{ title: 'Business Planning', description: 'Creating business plans', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Market Analysis', description: 'Analyzing Reishi market', duration: '2 hours' }],
        learningObjectives: ['Create business plans', 'Analyze costs', 'Develop strategies'],
        materials: ['Business templates', 'Market reports', 'Financial tools'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 12,
        date: new Date('2024-04-12'),
        title: 'Advanced Cultivation Techniques',
        description: 'Advanced techniques in Reishi cultivation',
        topics: ['Advanced Methods', 'Yield Optimization', 'Automation'],
        practicalSessions: [{ title: 'Advanced Techniques', description: 'Practicing advanced methods', duration: '3 hours' }],
        theoreticalSessions: [{ title: 'Automation', description: 'Understanding automation options', duration: '1 hour' }],
        learningObjectives: ['Learn advanced methods', 'Optimize yield', 'Understand automation'],
        materials: ['Advanced equipment', 'Automation tools', 'Yield monitoring'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 13,
        date: new Date('2024-04-13'),
        title: 'Product Development',
        description: 'Developing Reishi-based products',
        topics: ['Product Types', 'Development Process', 'Marketing'],
        practicalSessions: [{ title: 'Product Development', description: 'Developing Reishi products', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Marketing Strategies', description: 'Marketing Reishi products', duration: '2 hours' }],
        learningObjectives: ['Develop products', 'Create marketing strategies', 'Understand product development'],
        materials: ['Product development tools', 'Marketing materials', 'Packaging samples'],
        instructor: 'Dr. Lakshmi Nair',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        dayNumber: 14,
        date: new Date('2024-04-14'),
        title: 'Future of Reishi Cultivation',
        description: 'Future trends and opportunities in Reishi cultivation',
        topics: ['Future Trends', 'Research Directions', 'Industry Outlook'],
        practicalSessions: [{ title: 'Future Planning', description: 'Planning for future developments', duration: '2 hours' }],
        theoreticalSessions: [{ title: 'Industry Outlook', description: 'Understanding industry future', duration: '2 hours' }],
        learningObjectives: ['Understand future trends', 'Plan for research', 'Analyze industry outlook'],
        materials: ['Future trend reports', 'Research papers', 'Industry analysis'],
        instructor: 'Dr. Arjun Pillai',
        startTime: '09:00',
        endTime: '17:00'
      }
    ]
  }
];

async function addSampleSchedules() {
  try {
    console.log('🌱 Adding sample training schedules...');

    for (const program of sampleSchedules) {
      console.log(`\nAdding schedules for program ID ${program.trainingProgramId}...`);
      
      // First, check if program exists
      const existingProgram = await prisma.trainingProgram.findUnique({
        where: { id: program.trainingProgramId }
      });
      
      if (!existingProgram) {
        console.log(`  - Program ID ${program.trainingProgramId} not found, skipping...`);
        continue;
      }
      
      for (const schedule of program.schedules) {
        // Check if schedule already exists for this program and day
        const existingSchedule = await prisma.trainingSchedule.findFirst({
          where: {
            trainingProgramId: program.trainingProgramId,
            dayNumber: schedule.dayNumber
          }
        });
        
        if (existingSchedule) {
          // Update existing schedule
          await prisma.trainingSchedule.update({
            where: { id: existingSchedule.id },
            data: {
              date: schedule.date,
              title: schedule.title,
              description: schedule.description,
              topics: schedule.topics,
              practicalSessions: schedule.practicalSessions,
              theoreticalSessions: schedule.theoreticalSessions,
              learningObjectives: schedule.learningObjectives,
              materials: schedule.materials,
              instructor: schedule.instructor,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: true
            }
          });
          console.log(`  - Updated Day ${schedule.dayNumber}: ${schedule.title}`);
        } else {
          // Create new schedule
          await prisma.trainingSchedule.create({
            data: {
              trainingProgramId: program.trainingProgramId,
              dayNumber: schedule.dayNumber,
              date: schedule.date,
              title: schedule.title,
              description: schedule.description,
              topics: schedule.topics,
              practicalSessions: schedule.practicalSessions,
              theoreticalSessions: schedule.theoreticalSessions,
              learningObjectives: schedule.learningObjectives,
              materials: schedule.materials,
              instructor: schedule.instructor,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: true
            }
          });
          console.log(`  - Added Day ${schedule.dayNumber}: ${schedule.title}`);
        }
      }
    }

    console.log('\n✅ Sample schedules added successfully!');
    
    // Verify the schedules were added
    const totalSchedules = await prisma.trainingSchedule.count();
    console.log(`\n📊 Total training schedules in database: ${totalSchedules}`);

  } catch (error) {
    console.error('❌ Error adding sample schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleSchedules();
