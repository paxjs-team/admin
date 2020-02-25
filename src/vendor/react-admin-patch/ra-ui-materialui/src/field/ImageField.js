import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import { withStyles, createStyles } from '@material-ui/core/styles'
import classnames from 'classnames'

import sanitizeRestProps from 'ra-ui-materialui/lib/field/sanitizeRestProps'
import { fieldPropTypes } from 'ra-ui-materialui/lib/field/types'

const styles = createStyles({
  list: {
    display: 'flex',
    listStyleType: 'none',
  },
  image: {
    margin: '0.5rem',
    maxHeight: '10rem',
  },
  smallImage: {
    margin: '0.5rem',
    maxHeight: '5rem',
  },
})

const ImageField = ({
  className,
  classes,
  record,
  source,
  src,
  title,
  small,
  ...rest
}) => {
  let sourceValue = get(record, source)

  if (!sourceValue) {
    return <div className={className} {...sanitizeRestProps(rest)} />
  }

  if (Array.isArray(sourceValue)) {
    return (
      <ul
        className={classnames(classes.list, className)}
        {...sanitizeRestProps(rest)}
      >
        {sourceValue.map((file, index) => {
          const fileTitleValue = get(file, title) || title
          let srcValue = get(file, src) || title

          if (srcValue instanceof File) {
            srcValue = srcValue.preview
          }

          return (
            <li key={index}>
              <img
                alt={fileTitleValue}
                title={fileTitleValue}
                src={srcValue}
                className={small ? classes.smallImage : classes.image}
              />
            </li>
          )
        })}
      </ul>
    )
  }

  const titleValue = get(record, title) || title

  if (sourceValue instanceof File) {
    sourceValue = sourceValue.preview
  }

  return (
    <div className={className} {...sanitizeRestProps(rest)}>
      <img
        title={titleValue}
        alt={titleValue}
        src={sourceValue}
        className={small ? classes.smallImage : classes.image}
      />
    </div>
  )
}

ImageField.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object,
  record: PropTypes.object,
  source: PropTypes.any,
  src: PropTypes.string,
  title: PropTypes.string,
  small: PropTypes.bool,
}

const EnhancedImageField = withStyles(styles)(ImageField)

EnhancedImageField.defaultProps = {
  addLabel: true,
}

EnhancedImageField.propTypes = {
  ...fieldPropTypes,
  src: PropTypes.string,
  title: PropTypes.string,
}

EnhancedImageField.displayName = 'EnhancedImageField'

export default EnhancedImageField
