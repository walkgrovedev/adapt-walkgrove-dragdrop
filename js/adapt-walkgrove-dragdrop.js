define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var DragdropView = ComponentView.extend({

    events: {
      'dragstart .js-drag-item': 'drag',
      'drop .js-drag-target': 'drop',
      'dragover .js-drag-target': 'allowDrop'
    },

    _draggable: null,
    
    preRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    },

    allowDrop: function(ev) {
      ev.preventDefault();
    },
    
    drag: function(ev) {
      _draggable = ev.target.id;
    },
    
    drop: function(ev) {
      ev.preventDefault();
      if (ev.target.classList.contains('js-drag-target')) {
        console.log(ev.target);
        ev.target.appendChild(document.getElementById(_draggable));
      }
    },

  },
  {
    template: 'dragdrop'
  });

  return Adapt.register('dragdrop', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: DragdropView
  });
});
