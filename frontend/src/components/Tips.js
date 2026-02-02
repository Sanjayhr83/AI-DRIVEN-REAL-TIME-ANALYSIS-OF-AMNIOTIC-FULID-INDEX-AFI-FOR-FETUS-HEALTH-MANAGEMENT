import React, { useState } from 'react';
import './PregnancyGuide.css';

const PregnancyGuide = () => {
  const [currentMonth, setCurrentMonth] = useState(1);
  const [kickCount, setKickCount] = useState(0);
  const [waterCups, setWaterCups] = useState(Array(8).fill(false));

  // Monthly data for pregnancy guide
  const pregnancyData = {
    1: {
      week: 4,
      progress: 10,
      babySize: "Baby is about the size of a poppy seed",
      trimester: "First Trimester",
      nutrition: [
        "Focus on folate-rich foods like leafy greens, citrus fruits, and beans",
        "Stay hydrated with at least 8-10 glasses of water daily",
        "Include protein sources like lean meats, eggs, and legumes",
        "Eat small, frequent meals to manage nausea",
        "Avoid raw or undercooked foods and unpasteurized dairy"
      ],
      exercise: [
        "Start with gentle walks for 15-20 minutes daily",
        "Practice prenatal yoga or stretching exercises",
        "Focus on breathing and relaxation techniques",
        "Avoid high-impact activities and contact sports",
        "Listen to your body and rest when needed"
      ],
      wellness: [
        "Schedule your first prenatal appointment",
        "Start taking prenatal vitamins with folic acid",
        "Get plenty of rest - aim for 7-9 hours of sleep",
        "Manage stress with meditation or gentle breathing",
        "Avoid alcohol, tobacco, and limit caffeine"
      ],
      baby: [
        "Neural tube forms, which will become brain and spinal cord",
        "Heart begins to beat and circulate blood",
        "Basic facial features start to develop",
        "Arm and leg buds appear",
        "Placenta begins to form and provide nourishment"
      ]
    },
    2: {
      week: 8,
      progress: 20,
      babySize: "Baby is about the size of a raspberry",
      trimester: "First Trimester",
      nutrition: [
        "Continue folate-rich foods for neural tube development",
        "Increase iron intake with leafy greens and lean red meat",
        "Eat calcium-rich foods like yogurt, cheese, and fortified plant milks",
        "Snack on nuts and seeds for healthy fats and minerals",
        "Ginger tea or candies may help with morning sickness"
      ],
      exercise: [
        "Continue with gentle walks and stretching",
        "Try swimming or water aerobics for low-impact exercise",
        "Practice pelvic floor exercises (Kegels)",
        "Avoid exercises that involve lying flat on your back",
        "Stay cool and hydrated during workouts"
      ],
      wellness: [
        "Morning sickness may peak - try small, frequent meals",
        "Wear comfortable, non-restrictive clothing",
        "Get dental check-up as pregnancy can affect gum health",
        "Consider joining a prenatal class or support group",
        "Track your symptoms to discuss with your healthcare provider"
      ],
      baby: [
        "All major organs have begun to form",
        "Fingers and toes are starting to develop",
        "Eyes are moving into position and eyelids are forming",
        "Baby begins making spontaneous movements",
        "The umbilical cord is fully formed"
      ]
    },
    3: {
      week: 12,
      progress: 30,
      babySize: "Baby is about the size of a plum",
      trimester: "First Trimester",
      nutrition: [
        "Continue with balanced meals focusing on protein and complex carbs",
        "Include omega-3 rich foods like salmon, walnuts, and chia seeds",
        "Eat plenty of fiber to prevent constipation",
        "Vitamin C helps with iron absorption - pair with iron-rich foods",
        "Small, frequent meals can help with lingering nausea"
      ],
      exercise: [
        "You may have more energy - gradually increase activity if comfortable",
        "Continue with prenatal yoga and walking",
        "Avoid activities with risk of falling or abdominal impact",
        "Focus on posture as your center of gravity begins to shift",
        "Listen to your body and don't push through fatigue"
      ],
      wellness: [
        "First trimester screening tests may be scheduled",
        "Morning sickness typically improves around this time",
        "Your uterus is expanding - you might notice a small bump",
        "Skin changes may occur - use pregnancy-safe skincare",
        "Consider starting a pregnancy journal"
      ],
      baby: [
        "Baby's reflexes are developing - can make a fist",
        "Vocal cords are forming",
        "Kidneys are beginning to function",
        "Baby can swallow amniotic fluid",
        "Sex organs are developing but not yet visible on ultrasound"
      ]
    },
    4: {
      week: 16,
      progress: 40,
      babySize: "Baby is about the size of an avocado",
      trimester: "Second Trimester",
      nutrition: [
        "Increase calorie intake by about 300-350 calories per day",
        "Focus on iron-rich foods to support increased blood volume",
        "Calcium remains important for baby's bone development",
        "Include vitamin D sources like fortified milk and sunlight",
        "Snack on fruits and vegetables for vitamins and fiber"
      ],
      exercise: [
        "This is often the most comfortable trimester for exercise",
        "Consider moderate-intensity activities like swimming or stationary biking",
        "Continue with strength training using light weights",
        "Avoid exercises that involve lying flat on your back",
        "Pay attention to any dizziness or discomfort"
      ],
      wellness: [
        "You might start feeling baby's first movements (quickening)",
        "Energy levels typically increase during this trimester",
        "Consider maternity clothes for comfort",
        "Sleep on your side with a pillow between your knees",
        "Schedule your anomaly scan (usually around 18-20 weeks)"
      ],
      baby: [
        "Baby's skeleton is changing from soft cartilage to bone",
        "Taste buds are forming",
        "Baby can hear sounds from outside the womb",
        "Eyebrows and eyelashes are growing",
        "Baby is practicing breathing movements"
      ]
    },
    5: {
      week: 20,
      progress: 50,
      babySize: "Baby is about the size of a banana",
      trimester: "Second Trimester",
      nutrition: [
        "Continue with balanced nutrition focusing on protein and healthy fats",
        "Omega-3 fatty acids support baby's brain development",
        "Stay hydrated to help with swelling and constipation",
        "Include probiotic foods like yogurt for digestive health",
        "Small, frequent meals can help with heartburn"
      ],
      exercise: [
        "Continue with moderate exercise as comfortable",
        "Consider prenatal exercise classes for specialized guidance",
        "Pay attention to pelvic stability - avoid wide stances",
        "Swimming is excellent for relieving pressure on joints",
        "Stop any activity that causes pain or discomfort"
      ],
      wellness: [
        "You'll likely have your anatomy scan this month",
        "Baby's movements become more noticeable",
        "You might experience round ligament pain",
        "Consider starting perineal massage (with healthcare provider approval)",
        "Plan for childbirth education classes"
      ],
      baby: [
        "Baby is covered in vernix caseosa, a protective coating",
        "Hair may be growing on the scalp",
        "Baby is more active - you'll feel kicks and movements",
        "Sleep-wake cycles are developing",
        "Baby can swallow and digest small amounts of amniotic fluid"
      ]
    },
    6: {
      week: 24,
      progress: 60,
      babySize: "Baby is about the size of an ear of corn",
      trimester: "Second Trimester",
      nutrition: [
        "Continue with nutrient-dense foods as baby's growth accelerates",
        "Iron needs increase - include red meat, spinach, and lentils",
        "Calcium remains crucial for bone development",
        "Fiber helps prevent constipation and hemorrhoids",
        "Smaller meals can help with reduced stomach space"
      ],
      exercise: [
        "Modify exercises as your belly grows",
        "Focus on exercises that strengthen the back and core",
        "Avoid exercises that involve jumping or quick direction changes",
        "Pelvic tilts can help with back discomfort",
        "Stay hydrated and take breaks as needed"
      ],
      wellness: [
        "You might experience Braxton Hicks contractions",
        "Gestational diabetes screening typically occurs around 24-28 weeks",
        "Your belly button might pop out",
        "Consider starting to prepare the nursery",
        "Sleep may become more challenging - use pillows for support"
      ],
      baby: [
        "Baby's lungs are developing surfactant for breathing after birth",
        "Fingerprints and footprints are forming",
        "Baby responds to sounds and may recognize your voice",
        "Eyes can open and close",
        "Baby is gaining weight steadily"
      ]
    },
    7: {
      week: 28,
      progress: 70,
      babySize: "Baby is about the size of an eggplant",
      trimester: "Third Trimester",
      nutrition: [
        "Continue with balanced nutrition - baby is gaining weight rapidly",
        "Small, frequent meals help with heartburn and fullness",
        "Focus on iron-rich foods to prevent anemia",
        "Stay hydrated to help with swelling and prevent contractions",
        "Include protein with each meal for sustained energy"
      ],
      exercise: [
        "Focus on gentle exercises that don't strain your joints",
        "Walking and swimming are excellent choices",
        "Practice prenatal yoga for flexibility and relaxation",
        "Avoid exercises that involve lying on your back",
        "Listen to your body - fatigue may increase"
      ],
      wellness: [
        "You'll have more frequent prenatal appointments now",
        "Consider taking a hospital tour",
        "Start thinking about your birth plan",
        "Practice relaxation and breathing techniques",
        "Pack your hospital bag around 36 weeks"
      ],
      baby: [
        "Baby's brain is developing rapidly",
        "Eyes can perceive light and dark",
        "Baby may hiccup - you'll feel rhythmic movements",
        "Baby is practicing breathing movements",
        "Most babies settle into head-down position by now"
      ]
    },
    8: {
      week: 32,
      progress: 80,
      babySize: "Baby is about the size of a squash",
      trimester: "Third Trimester",
      nutrition: [
        "Continue with nutrient-dense foods as baby's brain develops rapidly",
        "Small, frequent meals are essential as stomach space decreases",
        "Include healthy fats for baby's brain development",
        "Stay hydrated to help prevent preterm labor",
        "Calcium remains important for baby's bone development"
      ],
      exercise: [
        "Focus on gentle movements and stretching",
        "Pelvic tilts and circles can help with discomfort",
        "Walking is still excellent if comfortable",
        "Avoid any exercises that cause strain or pain",
        "Rest when needed - listen to your body"
      ],
      wellness: [
        "You might experience more Braxton Hicks contractions",
        "Sleep may become more challenging - use pillows for support",
        "Consider finalizing your birth plan",
        "Install the car seat around 36 weeks",
        "Discuss postpartum plans with your partner"
      ],
      baby: [
        "Baby is gaining about half a pound per week",
        "Bones are fully developed but still soft",
        "Baby's five senses are functional",
        "Most of the lanugo (fine hair) has disappeared",
        "Baby is running out of room to move dramatically"
      ]
    },
    9: {
      week: 36,
      progress: 90,
      babySize: "Baby is about the size of a watermelon",
      trimester: "Third Trimester",
      nutrition: [
        "Continue with small, frequent nutrient-dense meals",
        "Stay hydrated - it can help with Braxton Hicks contractions",
        "Include fiber to prevent constipation",
        "Focus on protein for energy and tissue repair",
        "Eat dates which may help with cervical ripening"
      ],
      exercise: [
        "Gentle walking can help encourage labor when the time comes",
        "Practice birthing positions like squatting or hands-and-knees",
        "Pelvic tilts and circles can help baby engage",
        "Focus on breathing and relaxation techniques",
        "Rest as much as possible - conserve energy for labor"
      ],
      wellness: [
        "You'll have weekly prenatal appointments now",
        "Finalize your hospital bag and birth plan",
        "Rest as much as possible - sleep when you can",
        "Practice perineal massage (with healthcare provider approval)",
        "Know the signs of labor and when to call your provider"
      ],
      baby: [
        "Baby is considered full-term at 37 weeks",
        "Lungs are mature and ready for breathing outside the womb",
        "Baby is settling into the pelvis (engagement)",
        "Most of the vernix has disappeared",
        "Baby's immune system is receiving antibodies from you"
      ]
    }
  };

  const currentData = pregnancyData[currentMonth];

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
  };

  const handleWaterCupClick = (index) => {
    const newWaterCups = [...waterCups];
    newWaterCups[index] = !newWaterCups[index];
    setWaterCups(newWaterCups);
  };

  const handleResetWater = () => {
    setWaterCups(Array(8).fill(false));
  };

  const handleKickCount = () => {
    setKickCount(prev => prev + 1);
  };

  const handleResetKicks = () => {
    setKickCount(0);
  };

  const getKickMessage = () => {
    if (kickCount >= 10) {
      return "Great! You've reached the recommended 10 movements.";
    }
    return "Keep tracking those precious movements!";
  };

  const getWaterMessage = () => {
    const filledCups = waterCups.filter(cup => cup).length;
    if (filledCups >= 8) {
      return "Excellent! You've met your hydration goal.";
    } else if (filledCups >= 6) {
      return "Good job! You're almost at your hydration goal.";
    }
    return "Stay hydrated! Goal: 8-10 glasses per day";
  };

  return (
    <div className="container" style={{ backgroundColor: '#f9dde3ff',marginTop:'50px' }}>
      <header>
        <h1>Interactive Pregnancy Health Guide and Tips</h1>
        <p className="subtitle">
          Your month-by-month companion for a healthy pregnancy journey with nutrition, 
          exercise, and wellness tips tailored to each stage.
        </p>
      </header>
      
      <div className="progress-container">
        <div className="week-counter">Week: <span id="week-display">{currentData.week}</span> of 40</div>
        <div className="progress-bar">
          <div 
            className="progress" 
            id="pregnancy-progress" 
            style={{ width: `${currentData.progress}%` }}
          ></div>
        </div>
        <div className="baby-size" id="baby-size">{currentData.babySize}</div>
        <div className="trimester" id="trimester">{currentData.trimester}</div>
      </div>
      
      <div className="month-selector">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(month => (
          <button
            key={month}
            className={`month-btn ${currentMonth === month ? 'active' : ''}`}
            onClick={() => handleMonthChange(month)}
          >
            Month {month}
          </button>
        ))}
      </div>
      
      <div className="content-area">
        <div className="card">
          <h2><span role="img" aria-label="nutrition">🍎</span> Nutrition & Diet</h2>
          <ul id="nutrition-content">
            {currentData.nutrition.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="card">
          <h2><span role="img" aria-label="exercise">💪</span> Exercise & Activity</h2>
          <ul id="exercise-content">
            {currentData.exercise.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="card">
          <h2><span role="img" aria-label="wellness">❤️</span> Health & Wellness</h2>
          <ul id="wellness-content">
            {currentData.wellness.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="card">
          <h2><span role="img" aria-label="baby">👶</span> Baby Development</h2>
          <ul id="baby-content">
            {currentData.baby.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="interactive-section">
        <div className="water-tracker">
          <h3>Daily Water Intake Tracker</h3>
          <p>{getWaterMessage()}</p>
          <div className="water-cups">
            {waterCups.map((isFilled, index) => (
              <div
                key={index}
                className={`water-cup ${isFilled ? 'filled' : ''}`}
                onClick={() => handleWaterCupClick(index)}
              ></div>
              
            ))}
          </div>
          <button className="reset-btn" onClick={handleResetWater}>Reset</button>
        </div>
        
        <div className="kick-counter" >
          <h3>Baby Kick Counter</h3>
          <p>Track your baby's movements (usually after 20 weeks)</p>
          <div className="counter-display" id="kick-count">{kickCount}</div>
          <button className="kick-btn" onClick={handleKickCount}>Count a Kick</button>
          <p id="kick-message">{getKickMessage()}</p>
          <button className="reset-btn" onClick={handleResetKicks}>Reset Counter</button>
        </div>
      </div>
      
      <div className="disclaimer">
        <p><strong>Important:</strong> This guide provides Health information and it is for Doctors and professional medical advice. Always consult with your healthcare provider for personalized guidance during your pregnancy.</p>
      </div>
      
      <footer>
        <p><b>Developed by Team SPSY</b> | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a>
        </p>
      </footer>
    </div>
  );
};

export default PregnancyGuide;