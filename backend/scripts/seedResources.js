require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const sampleResources = [
  {
    title: "10 Best Bodyweight Exercises for Beginners",
    content: `Starting your fitness journey can be overwhelming, but bodyweight exercises are perfect for beginners. Here are 10 essential exercises that require no equipment:

1. **Push-ups** - Start on your knees if needed
2. **Squats** - Focus on proper form over speed
3. **Planks** - Begin with 30-second holds
4. **Lunges** - Alternate legs for balance
5. **Mountain Climbers** - Great for cardio
6. **Burpees** - The ultimate full-body exercise
7. **Glute Bridges** - Strengthen your posterior chain
8. **Wall Sits** - Build leg endurance
9. **High Knees** - Improve cardiovascular health
10. **Jumping Jacks** - Classic warm-up exercise

Remember to start slow and focus on proper form. Gradually increase repetitions as you build strength.`,
    type: "article",
    category: "exercise",
    author: "Fitness Team",
    tags: ["beginner", "bodyweight", "home workout"],
    readTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
  },
  {
    title: "The Science of Post-Workout Nutrition",
    content: `What you eat after your workout is crucial for recovery and muscle growth. Here's what science tells us:

**The 30-Minute Window**
While not as critical as once believed, eating within 2 hours post-workout is beneficial for:
- Muscle protein synthesis
- Glycogen replenishment
- Reduced muscle soreness

**Ideal Post-Workout Meal Components:**
- **Protein (20-40g)**: Helps repair and build muscle
- **Carbohydrates (0.5-1.2g per kg body weight)**: Restores energy stores
- **Fluids**: Replace what you lost through sweat

**Best Foods:**
- Greek yogurt with berries
- Chocolate milk
- Tuna sandwich
- Protein smoothie with banana
- Quinoa salad with chicken

Timing your nutrition can make a significant difference in your fitness results.`,
    type: "article",
    category: "nutrition",
    author: "Dr. Sarah Johnson",
    tags: ["nutrition", "recovery", "protein", "science"],
    readTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500"
  },
  {
    title: "Quick Morning Stretch Routine",
    content: `Start your day right with this 10-minute morning stretch routine:

**1. Cat-Cow Stretch (1 minute)**
- On hands and knees, arch and round your back
- Helps wake up your spine

**2. Child's Pose (1 minute)**
- Kneel and sit back on heels, arms forward
- Stretches hips and lower back

**3. Downward Dog (1 minute)**
- From hands and knees, lift hips up
- Stretches hamstrings and calves

**4. Hip Circles (1 minute each direction)**
- Stand and rotate hips in circles
- Loosens hip joints

**5. Shoulder Rolls (1 minute)**
- Roll shoulders backward and forward
- Releases tension from sleep

**6. Neck Stretches (1 minute)**
- Gentle side-to-side and up-down movements
- Relieves neck stiffness

**7. Forward Fold (1 minute)**
- Bend forward from hips, let arms hang
- Stretches entire back body

**8. Spinal Twist (1 minute each side)**
- Seated twist to release spinal tension

End with deep breathing and set your intention for the day!`,
    type: "article",
    category: "wellness",
    author: "Yoga Instructor Maya",
    tags: ["stretching", "morning routine", "flexibility"],
    readTime: 4,
    imageUrl: "https://images.unsplash.com/photo-1506629905607-ce724f7e6c8e?w=500"
  },
  {
    title: "Essential Home Gym Equipment on a Budget",
    content: `Building a home gym doesn't have to break the bank. Here are the most versatile pieces of equipment that give you the best bang for your buck:

**Under $50:**
- **Resistance Bands Set ($15-25)**: Full body workouts, travel-friendly
- **Yoga Mat ($20-40)**: Floor exercises, stretching, yoga
- **Jump Rope ($10-20)**: Excellent cardio, builds coordination

**$50-$100:**
- **Adjustable Dumbbells ($60-90)**: Versatile strength training
- **Stability Ball ($30-50)**: Core work, balance training
- **Kettlebell ($40-80)**: Functional strength and cardio

**$100-$200:**
- **Pull-up Bar ($50-100)**: Upper body development
- **Adjustable Bench ($80-150)**: Increases exercise variety

**Investment Pieces ($200+):**
- **Power Rack ($300-800)**: Ultimate versatility and safety
- **Barbell and Plates ($200-500)**: Progressive overload

Start with the basics and add equipment as your fitness level and budget allow. Quality over quantity!`,
    type: "article",
    category: "equipment",
    author: "Equipment Expert Tom",
    tags: ["home gym", "budget", "equipment"],
    readTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
  },
  {
    title: "Finding Your Why: The Key to Fitness Success",
    content: `The biggest predictor of long-term fitness success isn't your workout plan or diet - it's your WHY.

**Common Surface-Level Reasons:**
- "I want to lose weight"
- "I should be healthier"
- "I want to look good"

**Dig Deeper to Find Your True Why:**
- I want to have energy to play with my kids
- I want to feel confident in my own skin
- I want to be strong and independent as I age
- I want to manage my stress and mental health
- I want to set a good example for my family

**How to Discover Your Why:**
1. Ask yourself "Why?" 5 times in a row
2. Think about your values and what matters most
3. Consider how fitness impacts other areas of your life
4. Imagine your life in 10 years with and without fitness

**Making It Stick:**
- Write your why down and keep it visible
- Review it when motivation is low
- Share it with supportive friends/family
- Connect daily actions to your bigger purpose

Your why is your anchor when the going gets tough. Make it meaningful, make it personal, and make it powerful.`,
    type: "article",
    category: "motivation",
    author: "Life Coach Jennifer",
    tags: ["motivation", "mindset", "goals"],
    readTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500"
  },
  {
    title: "Stay Hydrated During Workouts",
    content: "Proper hydration is crucial for optimal performance and recovery. Drink water before, during, and after exercise. Aim for 8oz every 15-20 minutes during intense workouts.",
    type: "tip",
    category: "wellness",
    author: "Health Team",
    tags: ["hydration", "performance", "health"],
    readTime: 1,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500"
  },
  {
    title: "Form Over Speed",
    content: "Always prioritize proper form over speed or weight. Poor form leads to injuries and reduces exercise effectiveness. Master the movement first, then increase intensity.",
    type: "tip",
    category: "exercise",
    author: "Personal Trainer Mike",
    tags: ["form", "safety", "technique"],
    readTime: 1,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
  },
  {
    title: "The 5-Minute Rule",
    content: "Can't find motivation to exercise? Commit to just 5 minutes. Often, starting is the hardest part, and you'll find yourself continuing beyond those initial 5 minutes.",
    type: "tip",
    category: "motivation",
    author: "Motivation Expert Lisa",
    tags: ["motivation", "consistency", "habits"],
    readTime: 1,
    imageUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500"
  }
];

async function seedResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_tracker');
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Insert sample resources
    const createdResources = await Resource.insertMany(sampleResources);
    console.log(`Created ${createdResources.length} sample resources`);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedResources();
