import * as React from 'react'
import { CommentOutlined, CoffeeOutlined, CompassOutlined } from '@ant-design/icons'
import { Menu, Button } from 'antd'
// import Logo from '../../../assets/img/fde-logo-40.svg'
// import ProfileIcon from '../../../assets/img/profile-icon.svg'
import authActions from '../pages/auth/auth-actions/auth-actions'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
// import Avatar from './avatar.svg'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Header from './header/header'

const { SubMenu } = Menu

export default function MainLayout(props) {
  const dispatch = useDispatch()
  const history = useNavigate()
  const location = useLocation()
  const { setShowingTour } = props
  const [loggedIn, setLoggedIn] = useState(false)
  const [isHelpButtonDisabled, setHelpButtonDisabled] = useState(false)
  const userDetails = useSelector((state) => state.auth.userDetails)
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const navigate = useNavigate();
  // Handler
  const navigateTo = (value) => {
    if (value.key === 'buitintour') {
      dispatch(appActions.setBuiltInTour(true))
      return setShowingTour(true)
    }
    if (value.key === 'helpdesk') {
      return window.open(helpDeskURL, '_blank').focus()
    }
    if (value.key === 'knowledgebase') {
      return window.open(knowledgeBaseURL, '_blank').focus()
    }
    if (value.key === 'supporting-docs') {
      return window.open(supportingDocsURL, '_blank').focus()
    }
    if (value.key === 'api') {
      return window.open(apiDocsURL, '_blank').focus()
    }
    if (value.key === 'datadocumentation') {
      return window.open(dataDocumentationURL, '_blank').focus()
    }
    if (value.key === 'manage') {
      return window.open(manageURL, '_blank').focus()
    }
    let url = ''
    if (value.key.includes('mailto')) {
      window.location = `${value.key}`
      return
    }
    return window.open(url + `/${value.key}`, '_blank').focus()
  }
  useEffect(() => {
    try {
      userDetails.username ? setLoggedIn(true) : setLoggedIn(false)   
    } catch (error) {
      appActions.setError(error)
    }
  }, [userDetails.username])

  const logout = () => {
    dispatch(authActions.toggleIsLoggedIn(false))
    navigate("/")
  }
  // Render
  return (
    <>
    <Header />
      <Outlet />
    </>
  )
}
