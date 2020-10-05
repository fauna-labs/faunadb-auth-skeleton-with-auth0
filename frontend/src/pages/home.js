import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'

import Loading from '../components/states/loading'
import { faunaQueries } from '../fauna/query-manager'

const Home = () => {
  const history = useHistory()
  const [dinos, setDinos] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, getAccessTokenSilently, isAuthenticated, error } = useAuth0()

  useEffect(() => {
    console.log('User:', user)

    if (error) {
      console.log(error)
      toast.error('error authenticating')
    } else if (isAuthenticated) {
      fetchDinos(setDinos, setLoading, getAccessTokenSilently, history)
    }
  }, [history, error, isAuthenticated, getAccessTokenSilently])

  if (loading) {
    return Loading()
  } else if (dinos && dinos.data.length) {
    return (
      <React.Fragment>
        <div className="dino-list">{showDinos(dinos)}</div>
      </React.Fragment>
    )
  } else {
    return (
      <div className="no-results-container">
        <p className="no-results-text">No Results Found</p>
        <img className="no-results-image" src="/images/dino-noresults.png" alt="no results" />
        <p className="no-results-subtext">No dinos are accessible!</p>
      </div>
    )
  }
}

async function fetchDinos(setDinos, setLoading, getAccessTokenSilently, history) {
  try {
    setLoading(true)
    const token = await getAccessTokenSilently()
    console.log('Token:', token)
    faunaQueries.setToken(token)
    const dinos = await faunaQueries.getDinos()
    console.log(dinos)
    if (dinos !== false) {
      setDinos(dinos)
      setLoading(false)
      history.push('/')
    }
  } catch (e) {
    setLoading(false)
    console.error('Error in fetching dinos', e)
  }
}

function showDinos(dinos) {
  return dinos.data.map((d, i) => {
    return (
      <div className="dino-card" key={'dino-card-' + i}>
        <span className="dino-title" key={'dino-card-title-' + i}>
          {d.data.name}
        </span>
        <div className="dino-image-container" key={'dino-card-container-' + i}>
          <img className="dino-image" key={'dino-card-image' + i} src={`/images/${d.data.icon}`} alt="no results"></img>
        </div>
        <span key={'dino-card-rarity-' + i} className={'dino-rarity ' + d.data.rarity}>
          {d.data.rarity}
        </span>
      </div>
    )
  })
}

export default Home
