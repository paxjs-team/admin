import debounce from 'lodash/debounce'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Quill from 'quill'
import { addField } from 'ra-core'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import SlotPlaceholder from './SlotPlaceholder'
import SelectWidgetModal from './SelectWidgetModal'

import { uploadFile } from 'firebase-data-provider'

import styles from './styles'

// Do not sanitize image urls
Quill.import('formats/image').sanitize = function(url) {
  return url // No sanitization
}

// add "myapp" protocol in link protocol whitelist
Quill.import('formats/link').PROTOCOL_WHITELIST.push('myapp')

// register <slot></slot> element for ads and widgets
Quill.register({ 'formats/slot': SlotPlaceholder })

let Parchment = Quill.import('parchment')
let Delta = Quill.import('delta')
let Break = Quill.import('blots/break')
let Embed = Quill.import('blots/embed')

function lineBreakMatcher() {
  let newDelta = new Delta()

  newDelta.insert({ break: '' })

  return newDelta
}

Break.prototype.insertInto = function(parent, ref) {
  Embed.prototype.insertInto.call(this, parent, ref)
}
Break.prototype.length = function() {
  return 1
}
Break.prototype.value = function() {
  return '\n'
}

class RichTextInput extends Component {
  lastValueChange = null

  static propTypes = {
    addLabel: PropTypes.bool.isRequired,
    classes: PropTypes.object,
    input: PropTypes.object,
    label: PropTypes.string,
    meta: PropTypes.object,
    options: PropTypes.object,
    source: PropTypes.string,
    toolbar: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.bool,
      PropTypes.shape({
        container: PropTypes.array,
        handlers: PropTypes.object,
      }),
    ]),
    fullWidth: PropTypes.bool,
    basePath: PropTypes.string,
    storageDir: PropTypes.string,
  }

  static defaultProps = {
    addLabel: true,
    options: {}, // Quill editor options
    record: {},
    toolbar: true,
    fullWidth: true,
  }

  selectWidgetModalRef = React.createRef()

  componentDidMount() {
    const {
      input: { value },
      options,
    } = this.props

    this.quill = new Quill(this.divRef, {
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            ['showHtml'],
            ['ad'],
            ['widget'],
          ],
          handlers: {
            image: this.onAddImage,
            showHtml: this.onShowHtml,
            ad: this.onAddAdPlaceholder,
            widget: this.onAddWidgetPlaceholder,
          },
        },
        clipboard: {
          matchVisual: false,
          matchers: [['BR', lineBreakMatcher]],
        },
        keyboard: {
          bindings: {
            handleEnter: {
              key: 13,
              handler: function(range, context) {
                if (range.length > 0) {
                  this.quill.scroll.deleteAt(range.index, range.length) // So we do not trigger text-change
                }
                let lineFormats = Object.keys(context.format).reduce(function(
                  lineFormats,
                  format
                ) {
                  if (
                    Parchment.query(format, Parchment.Scope.BLOCK) &&
                    !Array.isArray(context.format[format])
                  ) {
                    lineFormats[format] = context.format[format]
                  }

                  return lineFormats
                },
                {})
                let previousChar = this.quill.getText(range.index - 1, 1)

                // Earlier scroll.deleteAt might have messed up our selection,
                // so insertText's built in selection preservation is not reliable
                this.quill.insertText(
                  range.index,
                  '\n',
                  lineFormats,
                  Quill.sources.USER
                )

                if (previousChar === '' || previousChar === '\n') {
                  this.quill.setSelection(range.index + 2, Quill.sources.SILENT)
                } else {
                  this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
                }
                // this.quill.selection.scrollIntoView()
                Object.keys(context.format).forEach(name => {
                  if (lineFormats[name] != null) {
                    return
                  }

                  if (Array.isArray(context.format[name])) {
                    return
                  }

                  if (name === 'link') {
                    return
                  }
                  this.quill.format(
                    name,
                    context.format[name],
                    Quill.sources.USER
                  )
                })
              },
            },
            linebreak: {
              key: 13,
              shiftKey: true,
              handler: function(
                range
                // , context
              ) {
                let nextChar = this.quill.getText(range.index + 1, 1)

                // let ee = this.quill.insertEmbed(
                //   range.index,
                //   'break',
                //   true,
                //   'user'
                // )
                if (nextChar.length === 0) {
                  // second line break inserts only at the end of parent element
                  // let ee = this.quill.insertEmbed(
                  //   range.index,
                  //   'break',
                  //   true,
                  //   'user'
                  // )
                }
                this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
              },
            },
          },
        },
      },
      theme: 'snow',
      ...options,
    })

    this.quill.setContents(this.quill.clipboard.convert(value))

    this.editor = this.divRef.querySelector('.ql-editor')
    this.quill.on('text-change', debounce(this.onTextChange, 500))

    this.quill.root.spellcheck = false

    this.txtArea = document.createElement('textarea')

    this.txtArea.style.cssText =
      'width: 100%;margin: 0px;background: rgb(29, 29, 29);box-sizing: border-box;color: rgb(204, 204, 204);font-size: 15px;outline: none;padding: 20px;line-height: 24px;font-family: Consolas, Menlo, Monaco, &quot;Courier New&quot;, monospace;position: absolute;top: 0;bottom: 0;border: none;display:none'

    const htmlEditor = this.quill.addContainer('ql-custom')

    htmlEditor.appendChild(this.txtArea)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.input.value !== this.lastValueChange
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.input.value !== this.props.input.value ||
      this.htmlValue !== this.props.input.value
    ) {
      const selection = this.quill.getSelection()

      this.quill.setContents(
        this.quill.clipboard.convert(this.parseHTML(this.props.input.value))
      )

      if (selection && this.quill.hasFocus()) {
        this.quill.setSelection(selection)
      }
    }
  }

  componentWillUnmount() {
    this.quill.off('text-change', this.onTextChange)
    this.quill = null
  }

  onTextChange = () => {
    this.htmlValue = this.parseHTML(this.editor.innerHTML)

    this.props.input.onChange(this.htmlValue)
  }

  onBlur = () => {
    const value = this.parseHTML(this.editor.innerHTML)

    if (value !== this.props.input.value) {
      this.props.input.onBlur(value)
    }
  }

  onFocus = () => {
    const value = this.parseHTML(this.editor.innerHTML)

    this.props.input.onFocus(value)
  }

  onAddImage = () => {
    const { basePath } = this.props
    const storageDir = basePath ? basePath : this.props.storageDir

    if (!storageDir) {
      alert('Storage directory is required to upload file')

      return
    }

    const parentElement = document.querySelector('.ra-rich-text-input')

    let fileInput = parentElement.querySelector('input.ql-image[type=file]')

    if (fileInput == null) {
      fileInput = document.createElement('input')

      fileInput.setAttribute('type', 'file')

      fileInput.setAttribute(
        'accept',
        'image/png, image/gif, image/jpeg, image/bmp, image/x-icon'
      )

      fileInput.classList.add('ql-image')

      fileInput.addEventListener('change', async () => {
        const files = fileInput.files

        if (!files || !files.length) {
          return
        }

        const imageUrl = await uploadFile(files[0], storageDir)

        const range = this.quill.getSelection(true)

        this.quill.insertEmbed(range.index, 'image', imageUrl)
      })

      parentElement.appendChild(fileInput)
    }

    fileInput.click()
  }

  onAddAdPlaceholder = () => {
    const range = this.quill.getSelection()

    if (range) {
      this.quill.insertEmbed(range.index, 'slot', { class: 'ad-placeholder' })
    }
  }

  onAddWidgetPlaceholder = () => {
    this._widgetSelection = this.quill.getSelection()

    if (this.selectWidgetModalRef && this.selectWidgetModalRef.current) {
      this.selectWidgetModalRef.current.open()
    }
  }

  onSelectWidget = widgetId => {
    if (this._widgetSelection) {
      this.quill.insertEmbed(this._widgetSelection.index, 'slot', {
        class: 'widget-placeholder',
        'data-id': widgetId,
      })
    }
  }

  onShowHtml = () => {
    const textarea = this.txtArea

    textarea.style.display = textarea.style.display === 'none' ? '' : 'none'

    this.quill.on('text-change', () => {
      let html = this.parseHTML(this.quill.root.innerHTML)

      textarea.value = html
    })

    if (textarea.style.display === '') {
      let html = this.parseHTML(this.quill.root.innerHTML)

      this.quill.pasteHTML(html)
    } else {
      this.quill.pasteHTML(textarea.value)
    }
  }

  updateDivRef = ref => {
    this.divRef = ref
  }

  parseHTML = html => {
    const value = html === '<p><br></p>' ? '' : html
    //prevents <img/> tags to be merge with <p> & <h*> tags
    const regex = /<p([^>]*?)><img([^>]*?)>([^>]*?)<\/p>/gm
    const regex2 = /<(h[0-9][^>]*?)><img([^>]*?)>([^>]*?)<\/(h[0-9])>/gm
    // removes line breaks & empty pharagraphs
    const regex3 = /<p>(<br>)?<\/p>/g
    // removes styling from list items
    const regex4 = /<li[^>]>([\s\S]*?)<\/li>/g

    const result = value
      .replace(regex, '<p><img $2 /></p><p$1>$3</p>')
      .replace(regex2, '<p><img $2 /></p><$1>$3</$4>')
      .replace(regex3, '')
      .replace(regex4, '<li><p>$1</p></li>')

    return result
  }

  render() {
    const { touched, error, helperText = false } = this.props.meta

    return (
      <FormControl
        error={error != null}
        fullWidth={this.props.fullWidth}
        className="ra-rich-text-input"
        onBlur={this.onBlur}
        onFocus={this.onFocus}
      >
        <SelectWidgetModal
          innerRef={this.selectWidgetModalRef}
          onSelect={this.onSelectWidget}
        />

        <div data-testid="quill" ref={this.updateDivRef} />

        {Boolean(touched && error) && (
          <FormHelperText error>{error}</FormHelperText>
        )}

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
}

const RichTextInputWithField = addField(withStyles(styles)(RichTextInput))

RichTextInputWithField.defaultProps = {
  addLabel: true,
  fullWidth: true,
}

export default RichTextInputWithField
