const fs = require('fs');

const data = JSON.parse(fs.readFileSync('moon_missions.json', 'utf8'));

data.forEach(m => {
  let cat = 'FAILURE';
  let subcat = 'N/A';
  let details = m.Notes || 'N/A';
  let anomaly = 'N/A';

  const notesLower = (m.Notes || '').toLowerCase();
  const outLower = (m.Outcome || '').toLowerCase();

  // Baseline mapping
  if (outLower === 'success' || outLower === 'successful' || outLower === 'active') {
    cat = 'FULL SUCCESS';
    subcat = 'Nominal';
  } else if (outLower.includes('partial')) {
    cat = 'PARTIAL SUCCESS';
    subcat = 'Component'; 
  } else if (outLower.includes('planned') || outLower.includes('future') || outLower.includes('scheduled')) {
    cat = 'PLANNED/FUTURE';
    subcat = 'Upcoming';
  } else {
    cat = 'FAILURE';
    if (notesLower.includes('launch') || notesLower.includes('exploded') || notesLower.includes('t+')) {
      subcat = 'Launch';
      anomaly = 'Launch Vehicle';
    } else if (notesLower.includes('impact') || notesLower.includes('crash') || notesLower.includes('landing')) {
      subcat = 'Landing';
      anomaly = 'Impact';
    } else if (notesLower.includes('orbit') || notesLower.includes('trajectory')) {
      subcat = 'Orbital';
      anomaly = 'Navigation/Propulsion';
    } else {
      subcat = 'Mid-course';
      anomaly = 'System Failure';
    }
  }

  // Specific Overrides requested by User
  if (m['Mission Name'].includes('SLIM')) {
    cat = 'FULL SUCCESS'; subcat = 'Nominal'; details = 'Nominal landing & ops'; anomaly = 'N/A';
  }
  if (m['Mission Name'].includes('IM-1') || m['Mission Name'].includes('IM1') || m['Mission Name'].includes('Odysseus')) {
    cat = 'PARTIAL SUCCESS'; subcat = 'Degraded'; details = 'Tilted landing, reduced functionality'; anomaly = 'Landing Attitude';
  }
  if (m['Mission Name'].includes('Peregrine')) {
    cat = 'PARTIAL SUCCESS'; subcat = 'Component'; details = 'Partial science accomplished before failure'; anomaly = 'Propulsion Anomaly';
  }
  if (m['Mission Name'].includes('Luna 25')) {
    cat = 'FAILURE'; subcat = 'Mid-course'; details = 'Propulsion anomaly led to forced deorbit'; anomaly = 'Propulsion';
  }
  if (m['Mission Name'].includes('Hakuto-R') || m['Mission Name'].includes('iSpace')) {
    cat = 'FAILURE'; subcat = 'Landing'; details = 'Hard impact, lander lost'; anomaly = 'Altitude Miscalculation';
  }
  if (m['Mission Name'].includes('Chandrayaan-2')) {
    cat = 'PARTIAL SUCCESS'; subcat = 'Orbiter Success'; details = 'Orbiter nominal, but Lander had hard impact on surface'; anomaly = 'Lander Descent Anomaly';
    m['Orbiter Success'] = 'Yes';
    m['Lander Success'] = 'No';
  }

  m['Outcome Category'] = cat;
  m['Outcome Subcategory'] = subcat;
  m['Outcome Details'] = details;
  m['Anomaly Type'] = anomaly;
});

fs.writeFileSync('moon_missions.json', JSON.stringify(data, null, 2));
console.log('Successfully updated 172 missions!');
