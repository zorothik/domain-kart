import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import Challenge from './Components/Challenge.js';
import Signup from './Components/chakra.js';
import Mainapp from './Components/mainapp.js';
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({}); // Default theme (or customize)

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
   <ChakraProvider theme={theme}>

      <Mainapp />
    </ChakraProvider>
    
  </React.StrictMode>
);

reportWebVitals();
