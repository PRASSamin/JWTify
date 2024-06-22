import React from 'react'
import Header from './global/header'
import Decoder from './jwt/decode-tool'
import JWTDoc from './jwt/jwt-doc'
import JWTTop from './jwt/jwt-top'
const Home = () => {
  return (
    <div className="">
      <Header/>
      <JWTTop main={"JWT Decoder"}/>
      <Decoder />
      <JWTDoc />
     </div>
  )
}

export default Home
