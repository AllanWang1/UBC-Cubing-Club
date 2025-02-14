import React from 'react'
import "../styles/Home.css"

import cubingLogo from "/ubc-cubing-logo.png";

const Home = () => {
  return (
    <div className='home'>
      <div className="intro">
        <img src={ cubingLogo } alt="" />
        <h2>UBC Cubing Club</h2>
      </div>
    </div>
  )
}

export default Home
