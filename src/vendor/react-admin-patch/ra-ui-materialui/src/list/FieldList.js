import React, { cloneElement, Component, Children } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { createStyles, withStyles } from '@material-ui/core/styles'
import { DataStructures } from 'react-admin-patch/ra-core'

const styles = createStyles({
  wrap: { display: 'flex', flexWrap: 'wrap', padding: 5 },
  noWrap: { display: 'block', padding: 5 },
  idsCount: {
    display: 'inline-block',
    marginLeft: 6,
  },
})

const sanitizeRestProps = ({
  currentSort,
  setSort,
  isLoading,
  loadedOnce,
  ...props
}) => props

/**
 * Iterator component to be used to display a list of entities, using a single field
 *
 * @example Display all the books by the current author
 * <ManyField source="countries">
 *     <FieldList>
 *         <ChipField source="title" />
 *     </FieldList>
 * </ManyField>
 *
 * By default, it includes a link to the <Edit> page of the related record
 * (`/books/:id` in the previous example).
 *
 * Set the linkType prop to "show" to link to the <Show> page instead.
 *
 * @example
 * <ManyField source="countries">
 *     <FieldList>
 *         <ChipField source="title" />
 *     </FieldList>
 * </ManyField>
 *
 * You can also prevent `<FieldList>` from adding link to children by setting
 * `linkType` to false.
 *
 * @example
 * <ManyField source="countries">
 *     <FieldList>
 *         <ChipField source="title" />
 *     </FieldList>
 * </ManyField>
 */
class FieldList extends Component {
  // Our handleClick does nothing as we wrap the children inside a Link but it is
  // required fo ChipField which uses a Chip from material-ui.
  // The material-ui Chip requires an onClick handler to behave like a clickable element
  handleClick = () => {}

  render() {
    const {
      classes = {},
      className,
      ids,
      data,
      resource,
      basePath,
      children,
      linkType,
      wrap,
      dataStructure,
      limit,
      transformIds,
      ...rest
    } = this.props

    let source

    if (
      dataStructure === DataStructures.REFERENCE_BOOLEAN_MAP ||
      dataStructure === DataStructures.JOINED_LIST
    ) {
      source = 'id'
    }

    let transformedIds

    if (transformIds) {
      transformedIds = transformIds(ids)
    } else {
      transformedIds = ids
    }

    const renderedIds = limit ? transformedIds.slice(0, limit) : transformedIds

    return (
      <div
        className={classnames(wrap ? classes.wrap : classes.noWrap, className)}
        {...sanitizeRestProps(rest)}
      >
        {renderedIds.map(id =>
          cloneElement(Children.only(children), {
            key: id,
            record: data[id],
            resource,
            basePath,
            source,
          })
        )}

        {limit && transformedIds.length > limit ? (
          <span className={classes.idsCount}>
            {' '}
            + {transformedIds.length - limit}
          </span>
        ) : null}
      </div>
    )
  }
}

FieldList.propTypes = {
  transformIds: PropTypes.func,
  dataStructure: PropTypes.string,
  basePath: PropTypes.string,
  children: PropTypes.element.isRequired,
  classes: PropTypes.object,
  className: PropTypes.string,
  data: PropTypes.object,
  ids: PropTypes.array,
  linkType: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  resource: PropTypes.string,
  wrap: PropTypes.bool,
  limit: PropTypes.number,
}

FieldList.defaultProps = {
  classes: {},
  linkType: 'edit',
  wrap: true,
  dataStructure: DataStructures.REFERENCE_LIST,
}

export default withStyles(styles)(FieldList)
