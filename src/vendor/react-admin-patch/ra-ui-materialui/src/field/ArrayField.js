import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import { DataStructures } from 'react-admin-patch/ra-core'
import Labeled from 'ra-ui-materialui/lib/input/Labeled'

const initialState = {
  data: {},
  ids: [],
}

/**
 * Display a collection
 *
 * Ideal for embedded arrays of objects, e.g.
 * {
 *   id: 123
 *   tags: [
 *     { name: 'foo' },
 *     { name: 'bar' }
 *   ]
 * }
 *
 * The child must be an iterator component
 * (like <Datagrid> or <SingleFieldList>).
 *
 * @example Display all the backlinks of the current post as a <Datagrid>
 * // post = {
 * //   id: 123
 * //   backlinks: [
 * //       {
 * //           date: '2012-08-10T00:00:00.000Z',
 * //           url: 'http://example.com/foo/bar.html',
 * //       },
 * //       {
 * //           date: '2012-08-14T00:00:00.000Z',
 * //           url: 'https://blog.johndoe.com/2012/08/12/foobar.html',
 * //       }
 * //    ]
 * // }
 *     <ArrayField source="backlinks">
 *         <Datagrid>
 *             <DateField source="date" />
 *             <UrlField source="url" />
 *         </Datagrid>
 *     </ArrayField>
 *
 * @example Display all the tags of the current post as <Chip> components
 * // post = {
 * //   id: 123
 * //   tags: [
 * //     { name: 'foo' },
 * //     { name: 'bar' }
 * //   ]
 * // }
 *     <ArrayField source="tags">
 *         <SingleFieldList>
 *             <ChipField source="name" />
 *         </SingleFieldList>
 *     </ArrayField>
 *
 * If you need to render a collection in a custom way, it's often simpler
 * to write your own component:
 *
 * @example
 *     const TagsField = ({ record }) => (
 *          <ul>
 *              {record.tags.map(item => (
 *                  <li key={item.name}>{item.name}</li>
 *              ))}
 *          </ul>
 *     )
 *     TagsField.defaultProps = { addLabel: true };
 */
export default class ArrayField extends React.PureComponent {
  static defaultProps = {
    dataStructure: DataStructures.REFERENCE_LIST,
  }

  static propTypes = {
    addLabel: PropTypes.bool,
    sortBy: PropTypes.string,
    source: PropTypes.string,
    label: PropTypes.string,
    sortable: PropTypes.bool,
    className: PropTypes.string,
    cellClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    textAlign: PropTypes.oneOf(['right', 'left']),
    record: PropTypes.object,
    basePath: PropTypes.string,
    dataStructure: PropTypes.string,
    children: PropTypes.any,
  }

  constructor(props) {
    super(props)
    this.state = props.record
      ? this.getDataAndIds(props.record, props.source)
      : initialState
  }

  componentWillReceiveProps(nextProps, prevProps) {
    if (nextProps.record !== prevProps.record) {
      this.setState(this.getDataAndIds(nextProps.record, nextProps.source))
    }
  }

  getDataAndIds(record, source) {
    const value = get(record, source)

    if (!value) {
      return initialState
    }

    const data = {}
    const ids = []

    const { dataStructure } = this.props

    switch (dataStructure) {
      case DataStructures.REFERENCE_LIST:
        value.forEach(item => {
          const itemId = typeof item !== 'string' ? JSON.stringify(item) : item

          data[itemId] = item

          ids.push(itemId)
        })
        break

      case DataStructures.REFERENCE_BOOLEAN_MAP:
        Object.keys(value).forEach(id => {
          if (value[id]) {
            data[id] = { id }

            ids.push(id)
          }
        })
        break

      case DataStructures.REFERENCE_NUMBER_MAP:
        getSortedKeysByNumericValue(value).forEach(id => {
          data[id] = { id }

          ids.push(id)
        })
        break

      case DataStructures.JOINED_LIST:
        value.split(',').forEach(id => {
          data[id] = { id }

          ids.push(id)
        })
        break

      default:
      // empty
    }

    return { data, ids }
  }

  render() {
    const {
      addLabel,
      basePath,
      children,
      record,
      sortable,
      source,
      label,
      ...rest
    } = this.props
    const { ids, data } = this.state

    const field = React.cloneElement(React.Children.only(children), {
      ids,
      data,
      isLoading: false,
      basePath,
      currentSort: {},
      ...rest,
    })

    if (addLabel && label) {
      return <Labeled label={label}>{field}</Labeled>
    }

    return field
  }
}

function getSortedKeysByNumericValue(numericMap) {
  if (!numericMap) {
    return []
  }

  return Object.keys(numericMap)
    .map(key => [key, numericMap[key]])
    .sort((a, b) => a[1] - b[1])
    .map(item => item[0])
}
