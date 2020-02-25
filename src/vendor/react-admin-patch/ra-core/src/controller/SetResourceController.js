import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import withTranslate from 'ra-core/lib/i18n/translate'
import { crudGetOne, crudUpdate } from 'ra-core/lib/actions'
import checkMinimumRequiredProps from 'ra-core/lib/controller/checkMinimumRequiredProps'

export class UnconnectedSetResourceController extends Component {
  componentDidMount() {
    this.updateData()
  }

  updateData(resource = this.props.resource) {
    this.props.crudGetOne(resource, undefined, this.props.basePath)
  }

  save = (data, redirect) => {
    const { dispatchCrudUpdate } = this.props

    dispatchCrudUpdate(
      this.props.resource,
      undefined, // this.props.id
      data,
      this.props.record,
      this.props.basePath,
      redirect
    )
  }

  render() {
    const {
      basePath,
      children,
      isLoading,
      record,
      resource,
      translate,
      version,
    } = this.props

    if (!children) {
      return null
    }

    return children({
      isLoading,
      defaultTitle: 'Set',
      save: this.save,
      resource,
      basePath,
      record,
      redirect: false,
      translate,
      version,
    })
  }
}

UnconnectedSetResourceController.propTypes = {
  basePath: PropTypes.string,
  children: PropTypes.any,
  isLoading: PropTypes.bool,
  record: PropTypes.object,
  resource: PropTypes.string,
  translate: PropTypes.func,
  version: PropTypes.number,
  dispatchCrudUpdate: PropTypes.func,
  crudGetOne: PropTypes.func,
}

function mapStateToProps(state, props) {
  return {
    record: state.admin.resources[props.resource]
      ? state.admin.resources[props.resource].data['undefined']
      : null,
    isLoading: state.admin.loading > 0,
  }
}

const SetResourceController = compose(
  checkMinimumRequiredProps('SetResource', ['basePath', 'resource']),
  connect(mapStateToProps, {
    crudGetOne,
    dispatchCrudUpdate: crudUpdate,
  }),
  withTranslate
)(UnconnectedSetResourceController)

export default SetResourceController
