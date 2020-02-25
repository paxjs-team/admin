import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import compose from 'recompose/compose'
import { createSelector } from 'reselect'
import isEqual from 'lodash/isEqual'

import {
  crudGetManyAccumulate as crudGetManyAccumulateAction,
  crudGetMatchingAccumulate as crudGetMatchingAccumulateAction,
} from 'ra-core/lib/actions/accumulateActions'
import {
  getPossibleReferences,
  getPossibleReferenceValues,
  getReferenceResource,
} from 'ra-core/lib/reducer'
import { getStatusForInput as getDataStatus } from './referenceDataStatus'
import withTranslate from 'ra-core/lib/i18n/translate'
import * as DataStructures from '../../DataStructures'

const defaultReferenceSource = (resource, source) => `${resource}@${source}`

/**
 * An Input component for choosing a reference record. Useful for foreign keys.
 *
 * This component fetches the possible values in the reference resource
 * (using the `CRUD_GET_MATCHING` REST method), then delegates rendering
 * to a subcomponent, to which it passes the possible choices
 * as the `choices` attribute.
 *
 * Use it with a selector component as child, like `<AutocompleteInput>`,
 * `<SelectInput>`, or `<RadioButtonGroupInput>`.
 *
 * @example
 * export const CommentEdit = (props) => (
 *     <Edit {...props}>
 *         <SimpleForm>
 *             <ReferenceInput label="Post" source="post_id" reference="posts">
 *                 <AutocompleteInput optionText="title" />
 *             </ReferenceInput>
 *         </SimpleForm>
 *     </Edit>
 * );
 *
 * @example
 * export const CommentEdit = (props) => (
 *     <Edit {...props}>
 *         <SimpleForm>
 *             <ReferenceInput label="Post" source="post_id" reference="posts">
 *                 <SelectInput optionText="title" />
 *             </ReferenceInput>
 *         </SimpleForm>
 *     </Edit>
 * );
 *
 * By default, restricts the possible values to 25. You can extend this limit
 * by setting the `perPage` prop.
 *
 * @example
 * <ReferenceInput
 *      source="post_id"
 *      reference="posts"
 *      perPage={100}>
 *     <SelectInput optionText="title" />
 * </ReferenceInput>
 *
 * By default, orders the possible values by id desc. You can change this order
 * by setting the `sort` prop (an object with `field` and `order` properties).
 *
 * @example
 * <ReferenceInput
 *      source="post_id"
 *      reference="posts"
 *      sort={{ field: 'title', order: 'ASC' }}>
 *     <SelectInput optionText="title" />
 * </ReferenceInput>
 *
 * Also, you can filter the query used to populate the possible values. Use the
 * `filter` prop for that.
 *
 * @example
 * <ReferenceInput
 *      source="post_id"
 *      reference="posts"
 *      filter={{ is_published: true }}>
 *     <SelectInput optionText="title" />
 * </ReferenceInput>
 *
 * The enclosed component may filter results. ReferenceInput passes a `setFilter`
 * function as prop to its child component. It uses the value to create a filter
 * for the query - by default { q: [searchText] }. You can customize the mapping
 * searchText => searchQuery by setting a custom `filterToQuery` function prop:
 *
 * @example
 * <ReferenceInput
 *      source="post_id"
 *      reference="posts"
 *      filterToQuery={searchText => ({ title: searchText })}>
 *     <SelectInput optionText="title" />
 * </ReferenceInput>
 */
export class UnconnectedReferenceInputController extends Component {
  constructor(props) {
    super(props)
    const { perPage, sort, filter } = props

    this.state = { pagination: { page: 1, perPage }, sort, filter }

    this.debouncedSetFilter = debounce(this.setFilter.bind(this), 500)
  }

  componentDidMount() {
    this.fetchReferenceAndOptions(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.record || { id: undefined }).id !==
      (nextProps.record || {}).id
    ) {
      this.fetchReferenceAndOptions(nextProps)
    } else if (this.props.input.value !== nextProps.input.value) {
      this.fetchReference(nextProps)
    } else if (
      !isEqual(nextProps.filter, this.props.filter) ||
      !isEqual(nextProps.sort, this.props.sort) ||
      nextProps.perPage !== this.props.perPage
    ) {
      this.setState(
        state => ({
          filter: nextProps.filter,
          pagination: {
            ...state.pagination,
            perPage: nextProps.perPage,
          },
          sort: nextProps.sort,
        }),
        this.fetchOptions
      )
    }
  }

  setFilter = filter => {
    if (filter !== this.state.filter) {
      this.setState(
        { filter: this.props.filterToQuery(filter) },
        this.fetchOptions
      )
    }
  }

  setPagination = pagination => {
    if (pagination !== this.state.pagination) {
      this.setState({ pagination }, this.fetchOptions)
    }
  }

  setSort = sort => {
    if (sort !== this.state.sort) {
      this.setState({ sort }, this.fetchOptions)
    }
  }

  fetchReference = (props = this.props) => {
    const {
      crudGetManyAccumulate,
      input,
      reference,
      dataStructure,
      optionId,
    } = props

    let id

    if (dataStructure === DataStructures.RECORD) {
      id = get(input.value, optionId)
    } else {
      id = input.value
    }

    if (id) {
      crudGetManyAccumulate(reference, [id])
    }
  }

  fetchOptions = (props = this.props) => {
    const {
      crudGetMatchingAccumulate,
      filter: filterFromProps,
      reference,
      referenceSource,
      resource,
      source,
    } = props
    const { pagination, sort, filter } = this.state

    crudGetMatchingAccumulate(
      reference,
      referenceSource(resource, source),
      pagination,
      sort,
      { ...filterFromProps, ...filter }
    )
  }

  fetchReferenceAndOptions(props) {
    this.fetchReference(props)
    this.fetchOptions(props)
  }

  render() {
    const {
      input,
      referenceRecord,
      matchingReferences,
      onChange,
      children,
      translate,
    } = this.props
    const { pagination, sort, filter } = this.state

    const dataStatus = getDataStatus({
      input,
      matchingReferences,
      referenceRecord,
      translate,
    })

    return children({
      choices: dataStatus.choices,
      error: dataStatus.error,
      isLoading: dataStatus.waiting,
      onChange,
      filter,
      setFilter: this.debouncedSetFilter,
      pagination,
      setPagination: this.setPagination,
      sort,
      setSort: this.setSort,
      warning: dataStatus.warning,
    })
  }
}

UnconnectedReferenceInputController.propTypes = {
  basePath: PropTypes.string,
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  crudGetMatchingAccumulate: PropTypes.func.isRequired,
  crudGetManyAccumulate: PropTypes.func.isRequired,
  filter: PropTypes.object,
  filterToQuery: PropTypes.func.isRequired,
  input: PropTypes.object.isRequired,
  label: PropTypes.string,
  matchingReferences: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  meta: PropTypes.object,
  onChange: PropTypes.func,
  perPage: PropTypes.number,
  record: PropTypes.object,
  referenceRecord: PropTypes.object,
  reference: PropTypes.string.isRequired,
  referenceSource: PropTypes.func.isRequired,
  resource: PropTypes.string.isRequired,
  sort: PropTypes.shape({
    field: PropTypes.string,
    order: PropTypes.oneOf(['ASC', 'DESC']),
  }),
  source: PropTypes.string,
  translate: PropTypes.func.isRequired,
}

UnconnectedReferenceInputController.defaultProps = {
  allowEmpty: false,
  filter: {},
  filterToQuery: searchText => ({ q: searchText }),
  matchingReferences: null,
  perPage: 25,
  sort: { field: 'id', order: 'DESC' },
  referenceRecord: null,
  referenceSource: defaultReferenceSource, // used in tests
  dataStructure: DataStructures.REFERENCE,
  optionId: 'id',
}

const makeMapStateToProps = () =>
  createSelector(
    [
      getReferenceResource,
      getPossibleReferenceValues,
      (_, props) => {
        const { input, dataStructure, optionId } = props

        if (dataStructure === DataStructures.RECORD) {
          return get(input.value, optionId)
        }

        return input.value
      },
    ],
    (referenceState, possibleValues, inputId) => ({
      matchingReferences: getPossibleReferences(
        referenceState,
        possibleValues,
        [inputId]
      ),
      referenceRecord: referenceState && referenceState.data[inputId],
    })
  )

const ReferenceInputController = compose(
  withTranslate,
  connect(makeMapStateToProps(), {
    crudGetManyAccumulate: crudGetManyAccumulateAction,
    crudGetMatchingAccumulate: crudGetMatchingAccumulateAction,
  })
)(UnconnectedReferenceInputController)

ReferenceInputController.defaultProps = {
  referenceSource: defaultReferenceSource, // used in makeMapStateToProps
}

export default ReferenceInputController
