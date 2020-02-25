import { Component } from 'react'
import { connect } from 'react-redux'
import get from 'lodash/get'
import PropTypes from 'prop-types'

import { crudGetManyAccumulate as crudGetManyAccumulateAction } from 'ra-core/lib/actions'
import { getReferencesByIds } from 'ra-core/lib/reducer/admin/references/oneToMany'
import getReferenceIdsBasedOnFieldValueAndDataStructure from '../getReferenceIdsBasedOnFieldValueAndDataStructure'

/**
 * A container component that fetches records from another resource specified
 * by an array of *ids* in current record.
 *
 * You must define the fields to be passed to the iterator component as children.
 *
 * @example Display all the products of the current order as datagrid
 * // order = {
 * //   id: 123,
 * //   product_ids: [456, 457, 458],
 * // }
 * <ReferenceArrayField label="Products" reference="products" source="product_ids">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="description" />
 *         <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceArrayField>
 *
 * @example Display all the categories of the current product as a list of chips
 * // product = {
 * //   id: 456,
 * //   category_ids: [11, 22, 33],
 * // }
 * <ReferenceArrayField label="Categories" reference="categories" source="category_ids">
 *     <SingleFieldList>
 *         <ChipField source="name" />
 *     </SingleFieldList>
 * </ReferenceArrayField>
 *
 */
export class UnconnectedReferenceArrayFieldController extends Component {
  state = {
    page: 1,
    perPage: this.props.perPage,
    pageIds: [],
  }

  setPage = page => this.setState({ page }, this.fetchReferences)

  setPerPage = perPage => this.setState({ perPage }, this.fetchReferences)

  componentDidMount() {
    this.fetchReferences()
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.record || { id: undefined }).id !==
      (nextProps.record || {}).id
    ) {
      this.fetchReferences(nextProps)
    }

    if (nextProps.ids.length < this.props.ids.length) {
      const currentNumberOfPages = Math.ceil(
        this.props.ids.length / this.props.perPage
      )

      const nextNumberOfPages = Math.ceil(
        nextProps.ids.length / this.props.perPage
      )

      if (
        nextNumberOfPages !== currentNumberOfPages &&
        currentNumberOfPages === this.state.page
      ) {
        this.setState(
          {
            page: this.state.page - 1,
          },
          () => this.fetchReferences(nextProps)
        )
      } else {
        this.fetchReferences(nextProps)
      }
    } else if (nextProps.ids.length > this.props.ids.length) {
      this.fetchReferences(nextProps)
    }
  }

  fetchReferences(
    { crudGetManyAccumulate, reference, ids, pagination } = this.props
  ) {
    let getIds = ids

    if (pagination) {
      const { page, perPage } = this.state

      getIds = ids.slice((page - 1) * perPage, page * perPage)

      this.setState({ pageIds: getIds })
    }

    if (getIds.length) {
      crudGetManyAccumulate(reference, getIds)
    }
  }

  render() {
    const {
      resource,
      reference,
      data,
      children,
      basePath,
      total,
      ids,
      pagination,
    } = this.props
    const { page, perPage, pageIds } = this.state

    const referenceBasePath = basePath.replace(resource, reference) // FIXME obviously very weak

    return children({
      // tslint:disable-next-line:triple-equals
      loadedOnce: data != undefined, // eslint-disable-line eqeqeq
      ids: pagination ? pageIds : ids,
      data,
      total,
      page,
      perPage,
      setPage: this.setPage,
      setPerPage: this.setPerPage,
      referenceBasePath,
      currentSort: {
        field: 'id',
        order: 'ASC',
      },
    })
  }
}

UnconnectedReferenceArrayFieldController.propTypes = {
  ids: PropTypes.array,
  page: PropTypes.number,
  pagination: PropTypes.any,
  perPage: PropTypes.number,
  setPage: PropTypes.func,
  setPerPage: PropTypes.func,
  setSort: PropTypes.func,
  total: PropTypes.number,
  resource: PropTypes.string,
  record: PropTypes.object,
  reference: PropTypes.string,
  data: PropTypes.object,
  children: PropTypes.any,
  basePath: PropTypes.string,
}

const mapStateToProps = (state, props) => {
  const { record, formData, source, reference, dataStructure } = props

  const data = formData || record

  const ids = getReferenceIdsBasedOnFieldValueAndDataStructure(
    get(data, source),
    dataStructure
  )

  return {
    data: getReferencesByIds(state, reference, ids),
    ids,
    total: ids.length,
  }
}

const ReferenceArrayFieldController = connect(mapStateToProps, {
  crudGetManyAccumulate: crudGetManyAccumulateAction,
})(UnconnectedReferenceArrayFieldController)

export default ReferenceArrayFieldController
