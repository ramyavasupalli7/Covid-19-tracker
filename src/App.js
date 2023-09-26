import React, { useState, useEffect } from "react";
import './Table.css';
import { MenuItem, FormControl, Select, Card, CardContent } from "@mui/material";
import InfoBox from './infoBox';
import numeral from "numeral";
import Map from "./Map";
import "./App.css";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [casesType, setCasesType] = useState("cases");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] =
  useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {        
        const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value:  country.countryInfo.iso2 // UK, USA, FR
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
     };

     getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    
    console.log("YOOOO >>>>", countryCode);

    setCountry(countryCode);

    const url =
     countryCode === "worldwide"
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`
      
    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCountry(countryCode);
console.log(data,"ss");
      // All of the data...
      // from the country response
      setCountryInfo(data);
    }); 
  };

  // console.log("COUNTRY INFO >>>",countryInfo)


  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
       <h1>COVID-19 TRACKER</h1>
       <FormControl className="app__dropdown">
        <Select 
        variant="outlined" 
        onChange={onCountryChange}
        value={country}
       >
          <MenuItem value ="worldwide">Worldwide</MenuItem>
          {countries.map((country) => (
            <MenuItem value={country.value}>{country.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>

    <div className="app__stats">
      <InfoBox 
        onClick={e => setCasesType("cases")}
        title="Coronavirus Cases"
        isRed
        active={casesType === "cases"}
        cases={prettyPrintStat(countryInfo.todayCases)} 
        total={numeral(countryInfo.cases).format("0.0a")}
      />
      <InfoBox 
        onClick={e => setCasesType("recovered")}
        title="Recovered" 
        active={casesType === "recovered"}
        cases={prettyPrintStat(countryInfo.todayRecovered)} 
        total={numeral(countryInfo.recovered).format("0.0a")}
      />
      <InfoBox 
        onClick={e => setCasesType("deaths")}
        title="Deaths" 
        active={casesType === ("deaths")}
        cases={prettyPrintStat(countryInfo.todayDeaths)} 
        total={numeral(countryInfo.deaths).format("0.0a")}
      />
    </div>

    <Map 
     casesType={casesType}
     countries={mapCountries} 
     center={mapCenter} 
     zoom={mapZoom}
    />
  </div>
  <Card className="app__right">
    <CardContent>
      <h3>Live Cases by Country</h3>
      <Table countries={tableData} />
      <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
      <LineGraph className="app_graph" casesType={casesType} />
      </CardContent>
    </Card>
  </div>

  );
}

export default App;
