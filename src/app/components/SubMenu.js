/**
 *
 * SubMenu
 *
 */

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'
import ExpandMore from '@material-ui/icons/ExpandMore'

import { withStyles } from '@material-ui/core/styles'
import { withRouter, matchPath } from 'react-router-dom'

const styles = {
  listItem: {
    paddingLeft: '1rem',
  },

  listItemText: {
    paddingLeft: 2,
    fontSize: '1rem',
  },

  listItemTextPrimary: {
    lineHeight: '1.46429em',
  },

  activeListItemIcon: {
    color: 'rgba(0,0,0,0.87)',
  },

  sidebarIsOpen: {
    paddingLeft: 25,
    transition: 'padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
  },

  sidebarIsClosed: {
    paddingLeft: 0,
    transition: 'padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
  },
}

export default
@withRouter
@withStyles(styles)
class SubMenu extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func,
    index: PropTypes.number,
    sidebarIsOpen: PropTypes.bool,
    isOpen: PropTypes.bool,
    label: PropTypes.string,
    icon: PropTypes.object,
    classes: PropTypes.object,
    location: PropTypes.object,
    children: PropTypes.any,
  }

  constructor(props) {
    super(props)

    let isActive = false

    const { location } = props
    const children = React.Children.toArray(props.children)

    for (let i = 0; i < children.length; i++) {
      const child = children[i]

      if (matchPath(location.pathname, child.props.to)) {
        isActive = true

        break
      }
    }

    this.state = {
      isActive,
    }
  }

  render() {
    const { sidebarIsOpen, isOpen, label, icon, classes, children } = this.props
    const { isActive } = this.state

    return (
      <Fragment>
        <ListItem
          dense
          button
          onClick={this._onClick}
          classes={{
            root: classes.listItem,
          }}
        >
          <ListItemIcon
            classes={{
              root: !isOpen && isActive ? classes.activeListItemIcon : '',
            }}
          >
            {!sidebarIsOpen && isOpen ? <ExpandMore /> : icon}
          </ListItemIcon>

          <ListItemText
            inset
            primary={!isOpen && isActive ? label : ''}
            secondary={!isOpen && isActive ? '' : label}
            classes={{
              root: classes.listItemText,
              primary: classes.listItemTextPrimary,
            }}
          />
        </ListItem>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List
            dense
            component="div"
            disablePadding
            className={
              sidebarIsOpen ? classes.sidebarIsOpen : classes.sidebarIsClosed
            }
          >
            {children}
          </List>

          <Divider />
        </Collapse>
      </Fragment>
    )
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this._onRouteChange()
    }
  }

  _onRouteChange = () => {
    const { location } = this.props
    const { isActive } = this.state

    const children = React.Children.toArray(this.props.children)

    for (let i = 0; i < children.length; i++) {
      const child = children[i]

      if (matchPath(location.pathname, child.props.to)) {
        if (!isActive) {
          this.setState({ isActive: true })
        }

        return
      }
    }

    if (isActive) {
      this.setState({ isActive: false })
    }
  }

  _onClick = () => {
    const { onToggle, label } = this.props

    onToggle && onToggle(label)
  }
}
