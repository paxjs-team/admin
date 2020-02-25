import Quill from 'quill'

let Embed = Quill.import('blots/block/embed')

class SlotPlaceholder extends Embed {
  static create(value) {
    let node = super.create()

    node.setAttribute('class', value.class)

    node.setAttribute('contenteditable', false)

    if (value['data-id']) {
      node.setAttribute('data-id', value['data-id'])
    }

    return node
  }

  static value(node) {
    return {
      class: node.getAttribute('class'),
      'data-id': node.getAttribute('data-id'),
    }
  }
}

SlotPlaceholder.blotName = 'slot'

SlotPlaceholder.tagName = 'slot'

export default SlotPlaceholder
