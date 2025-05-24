import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'
import MyProfile from './MyProfileDetails'
import MyButton from '../component/MyButton'


const saniaProfile = {
  name: 'Hedy Lamarr',
  bio: 'Hedy Lamarr was an Austrian-American actress and inventor. She co-invented an early version of frequency-hopping spread spectrum communication.',
  imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
  imageSize: 120,
  profession: 'Actress & Inventor',
  achievements: ['Co-invented frequency-hopping technology', 'Starred in numerous Hollywood films'],
};

const amarProfile = {
  name: 'Amarnath',
  bio: 'Amarnath s an Austrian-American actress and inventor. She co-invented an early version of frequency-hopping spread spectrum communication.',
  imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
  imageSize: 120,
  profession: 'Student',
  achievements: ['Co-invented frequency-hopping technology', 'Starred in numerous Hollywood films'],
};

export default function Home() {
  const [showProfile, setProfile]= useState(false) //we use a useState to rmber some info and alter it

  function handleButton() {
    setProfile(!showProfile) // alter the state to true or false that will determine whether to show profile or not
  }

  const [count, setCount] = useState(0)
    function handleClick() {
        setCount(count + 1);
    }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React - Sania </h1>
      <div className="card">
        <h2> Counters that update together </h2>
        <MyButton count = {count} onClick = {handleClick} />
        <p></p>
        <MyButton count = {count} onClick = {handleClick} />
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div>
        <button onClick={handleButton}> {showProfile ? "Hide Profile" : "Show Profile"} </button>
        {!showProfile ? null : <MyProfile user={amarProfile}/>}
      </div>
  
    </>
  );
}