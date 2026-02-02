import React, { useState } from 'react';
import './AmnioticFluid.css';

const AmnioticFluid = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const fluidComposition = [
    '98% water',
    'Electrolytes (Na⁺, K⁺, Cl⁻)',
    'Carbohydrates',
    'Lipids',
    'Proteins',
    'Urea',
    'Creatinine',
    'Bilirubin',
    'Fetal cells (used for genetic testing)',
    'Vernix caseosa',
    'Lanugo hair',
    'Hormones & enzymes'
  ];

  const fluidFunctions = [
    { id: 1, title: 'Protection', description: 'Acts as a shock absorber protecting the fetus from trauma and external pressure' },
    { id: 2, title: 'Temperature Regulation', description: 'Maintains a constant warm environment (around 37°C)' },
    { id: 3, title: 'Prevents Umbilical Cord Compression', description: 'Ensures free blood flow to the fetus' },
    { id: 4, title: 'Enables Fetal Movement', description: 'Helps develop muscles, bones, and joints by allowing movement' },
    { id: 5, title: 'Lung Development', description: 'Fetal breathing motions within the fluid help develop lungs and respiratory muscles' },
    { id: 6, title: 'Swallowing & GI Development', description: 'Fetus swallows the fluid → helps form gastrointestinal tract functions' },
    { id: 7, title: 'Prevents Amniotic Membrane Adhesions', description: 'Prevents the formation of amniotic bands that can restrict fetal growth' },
    { id: 8, title: 'Infection Control', description: 'Contains antibacterial properties' }
  ];

  const afiClassification = [
    { range: '< 5 cm', interpretation: 'Oligohydramnios (low fluid)' },
    { range: '5 – 18 cm', interpretation: 'Normal' },
    { range: '> 19 cm', interpretation: 'Polyhydramnios (excess fluid)' }
  ];

  const gestationalAmounts = [
    { week: '12 weeks', amount: '~50 mL' },
    { week: '20 weeks', amount: '~400 mL' },
    { week: '28–38 weeks', amount: '700–1000 mL (peak)' },
    { week: 'After 40 weeks', amount: 'Gradually decreases' }
  ];

  const assessmentMethods = [
    'AFI (Amniotic Fluid Index) - Most common method: sum of 4-quadrant fluid pockets',
    'Single Deepest Pocket (SDP) - Normal = 2–8 cm',
    'Subjective visual estimation',
    'Dye Dilution Test (rarely used in modern practice)'
  ];

  const diagnosticUses = [
    {
      title: 'Amniocentesis',
      uses: [
        'Genetic defects (Down syndrome)',
        'Fetal infections',
        'Lung maturity assessment (L/S ratio)',
        'Rh isoimmunization evaluation'
      ]
    },
    {
      title: 'Fetal lung maturity tests',
      uses: [
        'Lecithin/Sphingomyelin ratio',
        'Phosphatidylglycerol (PG) levels'
      ]
    }
  ];

  const abnormalities = {
    oligohydramnios: {
      causes: [
        'Rupture of membranes',
        'Placental insufficiency',
        'Post-term pregnancy (> 42 weeks)',
        'Fetal kidney or urinary tract abnormalities',
        'Maternal dehydration',
        'Preeclampsia / Hypertension'
      ],
      risks: [
        'Fetal growth restriction',
        'Umbilical cord compression',
        'Skeletal deformities',
        'Pulmonary hypoplasia'
      ],
      management: [
        'Maternal hydration',
        'Amnioinfusion during labor',
        'Close fetal monitoring (NST, BPP)',
        'Early delivery if distress occurs'
      ]
    },
    polyhydramnios: {
      causes: [
        'Maternal diabetes',
        'Fetal GI obstruction (e.g., duodenal atresia)',
        'Multiple pregnancies (twin-to-twin transfusion)',
        'Genetic abnormalities',
        'Unknown cause (50% idiopathic)'
      ],
      risks: [
        'Preterm labor',
        'Placental abruption',
        'Breech presentation',
        'Cord prolapse'
      ],
      management: [
        'Indomethacin (reduces fetal urine production)',
        'Amnioreduction (removal of excess fluid)',
        'Treat maternal diabetes',
        'Monitor for preterm labor'
      ]
    }
  };

  const productionMethods = [
    'Early pregnancy: Maternal plasma diffuses across membranes',
    'Later pregnancy: Fetal urine production becomes the major source',
    'Absorption occurs through fetal swallowing',
    'Intramembranous absorption across fetal blood vessels',
    'Transmembranous flow'
  ];

  return (
    <div className="amniotic-fluid-container">
      <header className="medical-header">
        <h1>⭐ AMNIOTIC FLUID — COMPLETE DETAILS</h1>
        <p className="subtitle" style={{ color: 'white', textDecoration: 'blink' }}>Comprehensive Medical Reference Guide</p>
      </header>

      <nav className="navigation-tabs">
        {['overview', 'composition', 'functions', 'measurement', 'abnormalities', 'management'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="content-area">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <section className="intro-section">
              <h2> Introduction </h2>
              <p>
                Amniotic fluid is the protective liquid that surrounds the fetus inside the amniotic sac during pregnancy. 
                It is essential for growth, movement, lung development, temperature control, and protection.
              </p>
              <p>
                It begins to form 12 days after conception and increases steadily until the third trimester.
              </p>
            </section>

            <section className="quick-facts">
              <h3>Key Facts</h3>
              <div className="facts-grid">
                <div className="fact-card">
                  <h4>Normal AFI Range</h4>
                  <p>5-18 cm</p>
                </div>
                <div className="fact-card">
                  <h4>Peak Volume</h4>
                  <p>700-1000 mL (28-38 weeks)</p>
                </div>
                <div className="fact-card">
                  <h4>Primary Function</h4>
                  <p>Fetal Protection & Development</p>
                </div>
                <div className="fact-card">
                  <h4>Major Source</h4>
                  <p>Fetal Urine (later pregnancy)</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Composition Tab */}
        {activeTab === 'composition' && (
          <div className="tab-content">
            <h2>  Composition of Amniotic Fluid </h2>
            <p>Amniotic fluid is not just water — it contains several vital substances:</p>
            
            <div className="composition-grid">
              {fluidComposition.map((item, index) => (
                <div key={index} className="composition-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <div className="tab-content">
            <h2> Functions of Amniotic Fluid </h2>
            <div className="functions-grid">
              {fluidFunctions.map(func => (
                <div key={func.id} className="function-card">
                  <h3>{func.id}. {func.title}</h3>
                  <p>{func.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Measurement Tab */}
        {activeTab === 'measurement' && (
          <div className="tab-content">
            <section className="measurement-section">
              <h2> Amniotic Fluid Index (AFI) </h2>
              <p>AFI measures the vertical depth of fluid in the four quadrants of the uterus using ultrasound.</p>
              
              <div className="afi-table">
                <h3>AFI Classification</h3>
                <table>
                  <thead>
                    <tr>
                      <th>AFI Range (cm)</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afiClassification.map((row, index) => (
                      <tr key={index}>
                        <td>{row.range}</td>
                        <td>{row.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="volume-section">
              <h2> Amount of Amniotic Fluid by Gestational Age </h2>
              <div className="volume-table">
                <table>
                  <thead>
                    <tr>
                      <th>Gestational Age</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gestationalAmounts.map((item, index) => (
                      <tr key={index}>
                        <td>{item.week}</td>
                        <td>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="assessment-section">
              <h2>  Clinical Assessment Methods </h2>
              <ul>
                {assessmentMethods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Abnormalities Tab */}
        {activeTab === 'abnormalities' && (
          <div className="tab-content">
            <h2> Abnormalities of Amniotic Fluid </h2>
            
            <div className="abnormalities-container">
              <div className="abnormality-section oligohydramnios">
                <h3>A. Oligohydramnios (Low Amniotic Fluid)</h3>
                
                <div className="abnormality-details">
                  <div className="detail-column">
                    <h4>Causes:</h4>
                    <ul>
                      {abnormalities.oligohydramnios.causes.map((cause, index) => (
                        <li key={index}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-column">
                    <h4>Risks:</h4>
                    <ul>
                      {abnormalities.oligohydramnios.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="abnormality-section polyhydramnios">
                <h3>B. Polyhydramnios (High Amniotic Fluid)</h3>
                
                <div className="abnormality-details">
                  <div className="detail-column">
                    <h4>Causes:</h4>
                    <ul>
                      {abnormalities.polyhydramnios.causes.map((cause, index) => (
                        <li key={index}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-column">
                    <h4>Risks:</h4>
                    <ul>
                      {abnormalities.polyhydramnios.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <section className="production-section">
              <h2>  How Amniotic Fluid Is Produced</h2>
              <ul>
                {productionMethods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Management Tab */}
        {activeTab === 'management' && (
          <div className="tab-content">
            <section className="management-section">
              <h2>  Management of Abnormal Amniotic Fluid</h2>
              
              <div className="management-container">
                <div className="management-column">
                  <h3>Oligohydramnios Management</h3>
                  <ul>
                    {abnormalities.oligohydramnios.management.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="management-column">
                  <h3>Polyhydramnios Management</h3>
                  <ul>
                    {abnormalities.polyhydramnios.management.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="diagnostic-section">
              <h2>  Diagnostic Uses of Amniotic Fluid</h2>
              {diagnosticUses.map((diagnostic, index) => (
                <div key={index} className="diagnostic-group">
                  <h3>{diagnostic.title}</h3>
                  <ul>
                    {diagnostic.uses.map((use, useIndex) => (
                      <li key={useIndex}>{use}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="summary-section">
              <h2> Summary </h2>
              <div className="summary-points">
                <p>Amniotic fluid protects, nourishes, and supports fetal development.</p>
                <p>Normal AFI = 5–24 cm.</p>
                <p>Too little = Oligohydramnios → risk of growth restriction & cord compression.</p>
                <p>Too much = Polyhydramnios → risk of preterm labor & malpresentation.</p>
                <p>Essential for lung development, movement, temperature control, GI formation, and infection prevention.</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmnioticFluid;