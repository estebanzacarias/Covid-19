import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';
import { prettyPrintStats, sortData } from './helper/sortData';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryinfo, setCountryInfo] = useState({});
  const [tabledata, setTableData] = useState([]);
  const [mapcenter, setMapCenter] = useState({lat: 0, lon: 0});
  const [mapzoom, setMapZoom] = useState(3);
  const [mapcountries, setMapCountries] = useState([]);
  const [casestype, setCasesType] = useState("cases");

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
         .then(data => {
            setCountryInfo(data);
         });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
        await fetch('https://disease.sh/v3/covid-19/countries')
          .then((res) => res.json())
          .then((data) => {
              const countries = data.map((country) => ({
                      name: country.country,
                      value: country.countryInfo.iso2
                  }));
                  
                  const sortedData = sortData(data);
                  setTableData(sortedData);
                  setMapCountries(data);
                  setCountries(countries);
                });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async e => {
     const countryCode = e.target.value;
     console.log(countryCode);
     setCountry(countryCode);

     const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
     await fetch(url)
       .then(response => response.json())
         .then((data) => {
            setCountry(countryCode);
            setCountryInfo(data);
            console.log(data)
            if(countryCode === 'worldwide'){
              setMapCenter({lat: 0, lon: 0});
              setMapZoom(2);
            } 
            else {
              setMapCenter({lat: data.countryInfo.lat, lon: data.countryInfo.long});
              setMapZoom(4);
            }
         });
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">  
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
              <Select variant="outlined" onChange={onCountryChange} value={country}>
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {
                      countries.map(country => (
                          <MenuItem value={country.value}>{country.name}</MenuItem>
                      ))
                  }
              </Select>
          </FormControl>
        </div>  

        <div className="app__stats">
            <InfoBox isRed active={casestype === "cases"} onClick={(e) => setCasesType("cases")} title="Covid-19 Cases" cases={prettyPrintStats(countryinfo.todayCases)} total={prettyPrintStats(countryinfo.cases)} />
            <InfoBox active={casestype === "recovered"} onClick={(e) => setCasesType("recovered")} title="Recovered" cases={prettyPrintStats(countryinfo.todayRecovered)} total={prettyPrintStats(countryinfo.recovered)} />
            <InfoBox isRed active={casestype === "deaths"} onClick={(e) => setCasesType("deaths")} title="Deaths" cases={prettyPrintStats(countryinfo.todayDeaths)} total={prettyPrintStats(countryinfo.deaths)} />
        </div>

        <Map casesType={casestype} countries={mapcountries} center={mapcenter} zoom={mapzoom} />
      </div>
      <Card className="app__right">
        <CardContent>
           <h3>Live Cases by Country</h3>
           <Table countries={tabledata} />
           <h3 className="app__graphTitle">Worldwide new {casestype}</h3>
           <LineGraph className="app__graph" casesType={casestype} />
        </CardContent>
      </Card>   
    </div>
  );
}

export default App;
