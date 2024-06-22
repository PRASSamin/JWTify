import React from 'react'
import Header from './global/header'
import Converter from './jwt/converter'
import JWTDoc from './jwt/jwt-doc'
import JWTTop from './jwt/jwt-top'
import Alert from './global/alert'
const Home = () => {
  return (
    <div className="">
      <Header/>
      <JWTTop main={"JWT Decoder"}/>
      <Converter />
      <JWTDoc />
     </div>
  )
}

export default Home
