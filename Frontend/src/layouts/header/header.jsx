import * as React from 'react'
import { CommentOutlined, CoffeeOutlined, CompassOutlined } from '@ant-design/icons'
import { Menu, Button } from 'antd'
import Logo from '../../../src/assets/images/maize.jpeg'
import UserLogo from '../../../src/assets/images/user.png'
import authActions from '../../pages/auth/auth-actions/auth-actions'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
// import Avatar from './avatar.svg'
import './header.css'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SignIn from '../../pages/auth/SignIn'

const { SubMenu } = Menu

export default function Header(props) {
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
    navigate("/login")
  }
  // Render
  return (
    <header style={{ display: 'flex' }}>
      <div className="header-left-group">
        <a href="/">
          <img src={Logo} className="fdw-logo-new" />
        </a>
        <div className="header-pages-group">
          {/* {permissions.includes('viz.view_fdevisualizations') ? (
            <Button
              style={
                location.pathname === '/saved-visualizations'
                  ? { borderBottom: '1px solid #096640', color: '#096640' }
                  : {}
              }
              onClick={() => history(`/data-explorer/saved-visualizations`)}
            >
              Visualizations
            </Button>
          ) : null} */}
        </div>
      </div>
      <Menu
        className="header-right-titles"
        mode="horizontal"
        onClick={navigateTo}
        theme="light"
        style={{
          position: 'absolute',
          right: 0,
          width: 440,
          height: 64,
          display: 'flex',
          justifyContent: 'right'
        }}
      >
          <Menu.Item key="manage" style={{ color: '#096640', paddingRight: 20 }}>
            Data management
          </Menu.Item>
         
              <Menu.Item key="supporting-docs" style={{ color: '#096640', paddingRight: 20 }}>
                Supporting docs
              </Menu.Item>

            <Menu.Item key="api" style={{ color: '#096640', paddingRight: 20 }}>
              API
            </Menu.Item>

              <SubMenu
                key="sub1"
                title={
                  <div style={{ height: 68, display: 'flex', alignItems: 'center' }}>
                    <img src={UserLogo} alt="profile-icon" style={{ width: 28, height: 28 }} />
                  </div>
                }
                id="help-button"
              >
                <div className="data-explorer-help">                  
                    <Button onClick={() => logout()} className="data-explorer-help-logout" type="link">
                      Log out
                    </Button>
                  </div>
            
              </SubMenu>
          
      </Menu>
    </header>
  )
}
