import React from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { addField, translate } from 'ra-core'
import {
  ReferenceManyInputController as ReferenceArrayInputController,
  DataStructures,
} from 'react-admin-patch/ra-core'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import SortIcon from '@material-ui/icons/Sort'
import CloseIcon from '@material-ui/icons/Close'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { withStyles } from '@material-ui/core/styles'
import LinearProgress from 'ra-ui-materialui/lib/layout/LinearProgress'
import Labeled from 'ra-ui-materialui/lib/input/Labeled'
import ReferenceError from 'ra-ui-materialui/lib/input/ReferenceError'
import Chip from '@material-ui/core/Chip'
import get from 'lodash/get'

const styles = {
  inputView: {
    display: 'inline-flex',
    alignItems: 'center',
  },

  dialog: {
    minWidth: '40vw',
    minHeight: '70vh',
  },

  dialogContent: {
    padding: 0,
    borderTop: '1px solid #d9d9d9',
    borderBottom: '1px solid #d9d9d9',
    overflowY: 'initial',
  },

  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },

  sortNumbersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    width: 40,
  },

  sortNumbers: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    height: '42px',
    fontWeight: 'bold',
    color: '#545454',
  },

  draggableList: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    paddingLeft: '40px',
    boxSizing: 'border-box',
    pointerEvents: 'inherit',
  },
}

const sanitizeRestProps = ({
  alwaysOn,
  basePath,
  component,
  crudGetMany,
  crudGetMatching,
  defaultValue,
  filterToQuery,
  formClassName,
  initializeForm,
  input,
  isRequired,
  label,
  locale,
  meta,
  optionText,
  optionValue,
  perPage,
  record,
  referenceSource,
  resource,
  allowEmpty,
  source,
  textAlign,
  translate,
  translateChoice,
  ...rest
}) => rest

export class ReferenceArrayInputView extends React.Component {
  state = {
    isSortingDialogOpened: false,
    values: [],
  }

  render() {
    const {
      allowEmpty,
      basePath,
      children,
      choices,
      className,
      error,
      input,
      isLoading,
      isRequired,
      label,
      meta,
      onChange,
      options,
      resource,
      setFilter,
      setPagination,
      setSort,
      source,
      translate,
      warning,
      classes,
      ...rest
    } = this.props
    const { dataStructure } = rest

    const translatedLabel = translate(
      label || `resources.${resource}.fields.${source}`,
      { _: label }
    )

    if (isLoading) {
      return (
        <Labeled
          label={translatedLabel}
          source={source}
          resource={resource}
          className={className}
          isRequired={isRequired}
        >
          <LinearProgress />
        </Labeled>
      )
    }

    if (error) {
      return <ReferenceError label={translatedLabel} error={error} />
    }

    return (
      <div style={styles.inputView}>
        {React.cloneElement(children, {
          allowEmpty,
          basePath,
          choices,
          className,
          error,
          input,
          isRequired,
          label: translatedLabel,
          meta: {
            ...meta,
            helperText: warning || false,
          },
          onChange,
          options,
          resource,
          setFilter,
          setPagination,
          setSort,
          source,
          translateChoice: false,
          limitChoicesToValue: true,
          ...sanitizeRestProps(rest),
        })}

        {dataStructure === DataStructures.REFERENCE_NUMBER_MAP && (
          <React.Fragment>
            <IconButton title="Sort" onClick={this._onSortButtonClick}>
              <SortIcon />
            </IconButton>

            <Dialog
              open={this.state.isSortingDialogOpened}
              onEscapeKeyDown={this._closeSortingDialog}
              onBackdropClick={this._closeSortingDialog}
              onClose={this._closeSortingDialog}
              classes={{
                paper: classes.dialog,
              }}
            >
              <DialogTitle
                classes={{
                  root: classes.dialogTitle,
                }}
              >
                <span>Sort Items</span>

                <IconButton
                  aria-label="Close"
                  className={classes.closeButton}
                  onClick={this._closeSortingDialog}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent className={classes.dialogContent} dividers="true">
                <DragDropContext onDragEnd={this._onDragEnd}>
                  <Droppable droppableId="droppable">
                    {droppableProvided => (
                      <div
                        ref={droppableProvided.innerRef}
                        className={classes.draggableList}
                      >
                        <div className={classes.sortNumbersContainer}>
                          {this.state.values.map((item, index) => (
                            <span key={item.id} className={classes.sortNumbers}>
                              {index + 1}
                            </span>
                          ))}
                        </div>

                        {this.state.values.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(draggableProvided, draggableSnapshot) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                {...draggableProvided.dragHandleProps}
                                style={this._getItemStyle(
                                  draggableSnapshot.isDragging,
                                  draggableProvided.draggableProps.style
                                )}
                              >
                                <Chip label={item.label} />
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {droppableProvided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </DialogContent>

              <DialogActions>
                <Button
                  onClick={this._saveArticlesOrder}
                  color="secondary"
                  autoFocus
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </React.Fragment>
        )}
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.dataStructure === DataStructures.REFERENCE_NUMBER_MAP &&
      nextProps.input.value &&
      this.props.choices !== nextProps.choices
    ) {
      const { value } = nextProps.input

      const childInput = React.Children.only(nextProps.children)
      const optionText = childInput.props.optionText || 'id'

      const values = Object.keys(value)
        .sort((a, b) => value[a] - value[b])
        .reduce((out, value) => {
          const choice = nextProps.choices.find(item => item.id === value)

          if (choice) {
            let label

            if (typeof optionText === 'string') {
              label = get(choice, optionText)
            } else if (typeof optionText === 'function') {
              label = optionText(choice)
            }

            if (!label) {
              label = choice.id
            }

            out.push({
              id: choice.id,
              label,
            })
          }

          return out
        }, [])

      this.setState({ values })
    }
  }

  _onDragEnd = result => {
    if (!result.destination) {
      return
    }

    const values = this.state.values.slice()
    const [removed] = values.splice(result.source.index, 1)

    values.splice(result.destination.index, 0, removed)

    this.setState({ values })
  }

  _saveArticlesOrder = () => {
    const sortedInputValue = this.state.values.reduce((out, item, index) => {
      out[item.id] = index + 1

      return out
    }, {})

    this.props.input.onChange(sortedInputValue)
    this._closeSortingDialog()
  }

  _getItemStyle = (isDragging, draggableStyle) => ({
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: '5px 7px',
    paddingRight: 5,
    userSelect: 'none',
    outline: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    boxShadow: isDragging ? '0px 0px 3px 0px rgba(0,0,0,0.75)' : 'none',
    ...draggableStyle,
  })

  _closeSortingDialog = () => this.setState({ isSortingDialogOpened: false })

  _onSortButtonClick = () => this.setState({ isSortingDialogOpened: true })
}

ReferenceArrayInputView.propTypes = {
  dataStructure: PropTypes.string,
  allowEmpty: PropTypes.bool,
  basePath: PropTypes.string,
  children: PropTypes.element,
  choices: PropTypes.array,
  className: PropTypes.string,
  error: PropTypes.string,
  isLoading: PropTypes.bool,
  isRequired: PropTypes.bool,
  input: PropTypes.object.isRequired,
  label: PropTypes.string,
  meta: PropTypes.object,
  onChange: PropTypes.func,
  options: PropTypes.object,
  resource: PropTypes.string.isRequired,
  setFilter: PropTypes.func,
  setPagination: PropTypes.func,
  setSort: PropTypes.func,
  source: PropTypes.string,
  translate: PropTypes.func.isRequired,
  warning: PropTypes.string,
  classes: PropTypes.object,
}

/**
 * An Input component for fields containing a list of references to another resource.
 * Useful for 'hasMany' relationship.
 *
 * @example
 * The post object has many tags, so the post resource looks like:
 * {
 *    id: 1234,
 *    tag_ids: [ "1", "23", "4" ]
 * }
 *
 * ReferenceArrayInput component fetches the current resources (using the
 * `CRUD_GET_MANY` REST method) as well as possible resources (using the
 * `CRUD_GET_MATCHING` REST method) in the reference endpoint. It then
 * delegates rendering to a subcomponent, to which it passes the possible
 * choices as the `choices` attribute.
 *
 * Use it with a selector component as child, like `<SelectArrayInput>`
 * or <CheckboxGroupInput>.
 *
 * @example
 * export const PostEdit = (props) => (
 *     <Edit {...props}>
 *         <SimpleForm>
 *             <ReferenceArrayInput source="tag_ids" reference="tags">
 *                 <SelectArrayInput optionText="name" />
 *             </ReferenceArrayInput>
 *         </SimpleForm>
 *     </Edit>
 * );
 *
 * By default, restricts the possible values to 25. You can extend this limit
 * by setting the `perPage` prop.
 *
 * @example
 * <ReferenceArrayInput
 *      source="tag_ids"
 *      reference="tags"
 *      perPage={100}>
 *     <SelectArrayInput optionText="name" />
 * </ReferenceArrayInput>
 *
 * By default, orders the possible values by id desc. You can change this order
 * by setting the `sort` prop (an object with `field` and `order` properties).
 *
 * @example
 * <ReferenceArrayInput
 *      source="tag_ids"
 *      reference="tags"
 *      sort={{ field: 'name', order: 'ASC' }}>
 *     <SelectArrayInput optionText="name" />
 * </ReferenceArrayInput>
 *
 * Also, you can filter the query used to populate the possible values. Use the
 * `filter` prop for that.
 *
 * @example
 * <ReferenceArrayInput
 *      source="tag_ids"
 *      reference="tags"
 *      filter={{ is_public: true }}>
 *     <SelectArrayInput optionText="name" />
 * </ReferenceArrayInput>
 *
 * The enclosed component may filter results. ReferenceArrayInput passes a
 * `setFilter` function as prop to its child component. It uses the value to
 * create a filter for the query - by default { q: [searchText] }. You can
 * customize the mapping searchText => searchQuery by setting a custom
 * `filterToQuery` function prop:
 *
 * @example
 * <ReferenceArrayInput
 *      source="tag_ids"
 *      reference="tags"
 *      filterToQuery={searchText => ({ name: searchText })}>
 *     <SelectArrayInput optionText="name" />
 * </ReferenceArrayInput>
 */
export const ReferenceArrayInput = ({ children, ...props }) => {
  if (React.Children.count(children) !== 1) {
    throw new Error(
      '<ReferenceArrayInput> only accepts a single child (like <Datagrid>)'
    )
  }

  return (
    <ReferenceArrayInputController {...props}>
      {controllerProps => (
        <ReferenceArrayInputView
          {...props}
          {...{ children, ...controllerProps }}
        />
      )}
    </ReferenceArrayInputController>
  )
}

ReferenceArrayInput.propTypes = {
  allowEmpty: PropTypes.bool.isRequired,
  basePath: PropTypes.string,
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
  filter: PropTypes.object,
  filterToQuery: PropTypes.func.isRequired,
  input: PropTypes.object.isRequired,
  label: PropTypes.string,
  meta: PropTypes.object,
  perPage: PropTypes.number,
  reference: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  sort: PropTypes.shape({
    field: PropTypes.string,
    order: PropTypes.oneOf(['ASC', 'DESC']),
  }),
  source: PropTypes.string,
  translate: PropTypes.func.isRequired,
  dataStructure: PropTypes.string.isRequired,
}

ReferenceArrayInput.defaultProps = {
  allowEmpty: false,
  filter: {},
  filterToQuery: searchText => ({ q: searchText }),
  perPage: 25,
  sort: { field: 'id', order: 'DESC' },
  dataStructure: DataStructures.REFERENCE_LIST,
}

const EnhancedReferenceArrayInput = compose(
  addField,
  translate
)(withStyles(styles)(ReferenceArrayInput))

export default EnhancedReferenceArrayInput
