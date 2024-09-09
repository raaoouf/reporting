import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, BarChart, PieChart, Pie } from 'recharts';
import styled from 'styled-components';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#f2b0b0', '#888888'];
const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* Utilisation de minmax(0, 1fr) pour minimiser l'espace */
  grid-gap: 10px; /* Espace réduit entre les div */
  margin-left: 260px;
`;

const ChartWrapper = styled.div`
  width: calc(99% - 20px); /* Largeur ajustée pour compenser l'espace entre les graphiques et les div */
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #fff; /* Changement de couleur en blanc */
  margin-bottom: 20px; /* Espace ajouté en bas de chaque div */
 
`;
const H4Style = {
  fontSize: '25px', // Taille de la police
  fontWeight: 'bold', // Poids de la police
  marginBottom: '20px', // Marge en bas
  position: 'relative', // Position relative pour faciliter le positionnement de la ligne
  textDecoration: 'underline', // Souligner le texte
};

const TriangleBar = (props) => {
  const { x, y, width, height, fill } = props;

  return (
    <g>
      <polygon points={`${x},${y + height} ${x + width},${y} ${x + width},${y + height}`} fill={fill} />
    </g>
  );
};


const transformData3 = (responseData) => {
  return Object.entries(responseData).map(([key, value]) => ({
    name: key,
    value: value,
  }));
};


const transformData1 = (responseData) => {
  return Object.entries(responseData).map(([key, value]) => ({
    name: key, // Assurez-vous que la clé correspond à l'axe X du graphique à barres
    accident_count: value, // Assurez-vous que la clé correspond aux valeurs de la barre
  }));
};

const transformData2 = (responseData) => {
  return Object.entries(responseData).map(([key, value]) => ({
    name: key,
    value: value,
  }));
};

const transformData = (responseData) => {
  return Object.entries(responseData).map(([month, timings]) => ({
    name: month,
    workTime: timings.workTime,
    afterWork: timings.afterWork,
    midnight: timings.midnight
  }));
};

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [accidentData, setAccidentData] = useState([]);
  const [selectedYear1, setSelectedYear1] = useState('2024');
  const [selectedYear5, setSelectedYear5] = useState(new Date().getFullYear());
  const [selectedYear2, setSelectedYear2] = useState('2023');
  const [radarData, setRadarData] = useState([]);
  const [data, setData] = useState([]);
  const [natureAccidentData, setNatureAccidentData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [causeData, setCauseData] = useState([]);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/CLASS?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        console.log('Class Data:', jsonData); // Debug log
        const formattedData2 = transformData2(jsonData);
        console.log('Transformed Class Data:', formattedData2);
        setClassData(formattedData2);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchClassData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchCauseData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/cause?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        const formattedData3= transformData3(jsonData);
        console.log('yasmine', formattedData3);

        setCauseData(formattedData3);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchCauseData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchAccidentData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/nombre-acc-year/?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log('Accident Data:', data); // Debug log
        const formattedData = Object.entries(data).map(([site, count]) => ({ name: site, uv: count }));
        setAccidentData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAccidentData();
  }, [selectedYear]);
  
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const sites = ['RA1G', 'RA2K', 'RA1K', 'RA1Z', 'CP2K', 'CP1K', 'RA1D'];
        const promises = sites.map(site =>
          Promise.all([
            fetch(`http://127.0.0.1:8000/api/nombre-acc-year-site?year=${selectedYear}&site=${site}`),
            fetch(`http://127.0.0.1:8000/api/nombre-acc-year-site?year=${selectedYear2}&site=${site}`)
          ])
        );
        const responses = await Promise.all(promises);
        const dataBySite = await Promise.all(responses.map(([response1, response2]) =>
          Promise.all([response1.json(), response2.json()])
        ));

        const radarData = sites.map((site, index) => {
          const dataYear1 = dataBySite[index][0].accidents_count;
          const dataYear2 = dataBySite[index][1].accidents_count;
          return { site, [selectedYear]: dataYear1, [selectedYear2]: dataYear2 };
        });

        console.log('Radar Data:', radarData); // Debug log
        setRadarData(radarData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
console.log(selectedYear)

    fetchRadarData();
  }, [selectedYear, selectedYear2]);

  useEffect(() => {
    const fetchTimingData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/TIMING?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        console.log('Timing Data:', jsonData); // Debug log
        const formattedData = transformData(jsonData);
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchTimingData();
  }, [selectedYear]);
  useEffect(() => {
    const fetchNatureAccidentData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/Nature?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        console.log('Nature Accident Data:', jsonData); // Debug log
        const formattedData1 = transformData1(jsonData);
        console.log('this',formattedData1)
        setNatureAccidentData(formattedData1);
        console.log(natureAccidentData)
      } catch (error) {
        console.error('Error fetching nature accident data:', error);
      }
    };
    fetchNatureAccidentData();
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  const handleYear1Change = (event) => {
    setSelectedYear1(event.target.value);
  };
  const handleYear2Change = (event) => {
    setSelectedYear2(event.target.value);
  };
  const handleYearChange2 = (event) => {
    setSelectedYear5(event.target.value);
  };
  return (
    <div>
      <ChartContainer>
        <ChartWrapper>
        <div style={{ backgroundColor: '#f0f8ff', padding: '4px', marginBottom: '15px', width: '180px', display: 'flex', alignItems: 'center' }}>
  <label htmlFor="year1" style={{ fontSize: '16px', marginRight: '10px' }}>Select Year 1:</label>
  <input
    type="text"
    id="year1"
    name="year1"
    value={selectedYear}
    onChange={handleYearChange}
    pattern="\d{4}"
    title="Enter a valid year (e.g., 2023)"
    style={{ width: '70px', height: '20px' }}
  />
</div>



          <h4  style={H4Style}>Répartition des Accidents par Site</h4>

          <div style={{ width: 500, height: 400 }}>
            <ComposedChart
              width={500}
              height={400}
              data={accidentData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="name" scale="band" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uv" fill="#8884d8" shape={<TriangleBar />} label={{ position: 'top' }}>
                {accidentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % 20]} />
                ))}
              </Bar>
            </ComposedChart>
          </div>
        </ChartWrapper>
        <ChartWrapper>
        <h4  style={H4Style} >Causes Principales d'Accidents</h4>

        <div style={{ width: '100%', height: 300 }}>
        {causeData.length > 0 ? ( // Render the chart only if there is data
          <ResponsiveContainer>
            <PieChart>
            <Pie dataKey="value" data={causeData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {causeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading data...</p> // Show a loading indicator
        )}
      </div>
        </ChartWrapper>
      </ChartContainer>

      <ChartContainer>
        <ChartWrapper>
        <h4  style={H4Style}>Horaire des Accidents</h4>

          <div style={{ width: '100%', height: 300 }}>
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid  />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="workTime" stackId="a" fill="#8884d8" />
            <Bar dataKey="afterWork" stackId="a" fill="#82ca9d" />
            <Bar dataKey="midnight" stackId="a" fill="#ff7300" />
          </BarChart>
          </div>
        </ChartWrapper>

        <ChartWrapper>
        <h4  style={H4Style} >Classe d'Accidents </h4>

          <div style={{ width: '100%', height: 300 }}>
          {classData.length > 0 ? ( 
          <ResponsiveContainer>
          
            <PieChart>
            <Pie dataKey="value" data={classData} fill="#8884d8" label>
                {classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading data...</p> // Show a loading indicator
        )}
          </div>
        </ChartWrapper>
      </ChartContainer>

      <ChartContainer>
        <ChartWrapper>
        <h4  style={H4Style} >Nature des Accidents</h4>

          <div style={{ width: '100%', height: 300 }}>
          <BarChart
            width={500}
            height={300}
            data={natureAccidentData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid  />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accident_count" barSize={30} >
                {natureAccidentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            

          </BarChart>
          </div>
        </ChartWrapper>
        <ChartWrapper>
<div style={{ backgroundColor: '#f0f8ff', padding: '4px', marginBottom: '15px', width: '180px', display: 'flex', alignItems: 'center' }}>
<label htmlFor="year2" style={{ fontSize: '16px', marginRight: '10px' }}>Select Year 2:</label>
<input
type="text"
id="year2"
name="year2"
value={selectedYear2}
onChange={handleYear2Change}
pattern="\d{4}"
title="Enter a valid year (e.g., 2023)"
style={{ width: '70px', height: '20px' }}
/>
</div>

  <h4  style={H4Style}>Évolution des Accidents entre deux années</h4>

  <div style={{ height: "400px", width: "500px" }}>
    <ResponsiveContainer>
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="site" />
      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
      <Radar name={selectedYear1} dataKey={selectedYear1} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} connectNulls={true} />
      <Radar name={selectedYear2} dataKey={selectedYear2} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} connectNulls={true} />
    </RadarChart>
    </ResponsiveContainer>
  </div>
</ChartWrapper>
       
      </ChartContainer>
    </div>
  );
};

export default Dashboard;

