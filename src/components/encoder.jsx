import React, { useEffect } from 'react'
import Header from './global/header'
import EncoderTool from './jwt/encode-tool'
import JWTDoc from './jwt/jwt-doc'
import JWTTop from './jwt/jwt-top'
const Encoder = () => {

  useEffect(() => {
    document.title = "Encode JWT | JWTify";
  
    let calLink = document.querySelector('link[rel="canonical"]');
  
    if (!calLink) {
      calLink = document.createElement('link');
      calLink.rel = 'canonical';
      document.head.appendChild(calLink);
    }
  
    calLink.href = "https://jwtify.onrender.com/jwt-encoder";
  }, []);
  

  return (
    <div className="">
      <Header/>
      <JWTTop main={"JWT Encoder"}/>
      <EncoderTool />
      <JWTDoc />
     </div>
  )
}

export default Encoder
