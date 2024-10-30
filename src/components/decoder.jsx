import React, { useEffect } from 'react'
import Header from './global/header'
import DecoderTool from './jwt/decode-tool'
import JWTDoc from './jwt/jwt-doc'
import JWTTop from './jwt/jwt-top'
const Decoder = () => {

  useEffect(() => {
    document.title = "Decode JWT | JWTify";
  
    let calLink = document.querySelector('link[rel="canonical"]');
  
    if (!calLink) {
      calLink = document.createElement('link');
      calLink.rel = 'canonical';
      document.head.appendChild(calLink);
    }
  
    calLink.href = "https://jwtify.onrender.com/jwt-decoder";
  }, []);
  


  return (
    <div className="">
      <Header/>
      <JWTTop main={"JWT Decoder"}/>
      <DecoderTool />
      <JWTDoc />
     </div>
  )
}

export default Decoder
