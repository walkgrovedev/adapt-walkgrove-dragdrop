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

      // let count = 0;
      // for( var intItem in this.model.get( '_items' ) ) {
      //   console.log("dragdrop__item-" + count);
      //   this.dragElement(document.getElementById("dragdrop__item-" + count));
      //   count++;
      // }
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
      console.log("drag: " + ev.target.id);
      _draggable = ev.target.id;
    },
    
    drop: function(ev) {
      ev.preventDefault();
      // var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(_draggable));
    },

    // dragElement: function(elmnt) {
    //   var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    //   if (document.getElementById(elmnt.id)) {
    //     // if present, the header is where you move the DIV from:
    //     document.getElementById(elmnt.id).onmousedown = dragMouseDown;
    //   } else {
    //     // otherwise, move the DIV from anywhere inside the DIV:
    //     elmnt.onmousedown = dragMouseDown;
    //   }

    //   function dragMouseDown(e){
    //     e = e || window.event;
    //     e.preventDefault();
    //     // get the mouse cursor position at startup:
    //     pos3 = e.clientX;
    //     pos4 = e.clientY;
    //     document.onmouseup = closeDragElement;
    //     // call a function whenever the cursor moves:
    //     document.onmousemove = elementDrag;
    //   }

    //   function elementDrag(e) {
    //     e = e || window.event;
    //     e.preventDefault();
    //     // calculate the new cursor position:
    //     pos1 = pos3 - e.clientX;
    //     pos2 = pos4 - e.clientY;
    //     pos3 = e.clientX;
    //     pos4 = e.clientY;
    //     // set the element's new position:
    //     elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    //     elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    //   }

    //   function closeDragElement() {
    //     // stop moving when mouse button is released:
    //     document.onmouseup = null;
    //     document.onmousemove = null;
    //     alert("released");
    //   }
    // },

  },
  {
    template: 'dragdrop'
  });

  return Adapt.register('dragdrop', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: DragdropView
  });
});
