define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var DragdropView = ComponentView.extend({

    events: {
      'dragstart .js-drag-item': 'drag',
      'drop .js-drag-target': 'drop',
      'dragover .js-drag-target': 'allowDrop',
      'click .js-dragdrop-check-click': 'onCheckClicked',
      'click .js-dragdrop-showfeedback-click': 'onCheckClicked'
    },

    _draggable: null,
    _isSubmitted: false,

    preRender: function() {
      this._isSubmitted = false;
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
      this._draggable = ev.target.id;
    },
    
    drop: function(ev) {
      ev.preventDefault();
      if (ev.target.classList.contains('js-drag-target') && !this._isSubmitted) {
        const draggable = document.getElementById(this._draggable);
        ev.target.appendChild(draggable);
        this.setItemVisited(draggable);

        var placeholderIndex = this.$(ev.target).data('placeholder') + 1;
        draggable.setAttribute('data-placeholder', placeholderIndex);
      }
    },

    onCheckClicked: function() {
      this._isSubmitted = true;
      
      let correct = true;

      this.model.get('_items').forEach(function(item, index) {
        const draggable_placeholder = this.$('.js-drag-item').eq(index).data('placeholder');
        if(item._placeholder !== draggable_placeholder) {
          correct = false;
        }
      });

      const feedbackInline = this.model.get('_feedbackInline');

      if(feedbackInline) {
        // INLINE FEEDBACK
        this.$('.dragdrop__feedback').addClass('is-visible');
        const divName = "#dragdrop__feedback";
        const element = document.querySelector(divName);
        // scroll to element
        setTimeout(function(){
          element.scrollIntoView(false);
        }, 100);
        if(correct) {
          this.$('.dragdrop__feedback-correct').addClass('show-feedback');
        } else {
          this.$('.dragdrop__feedback-incorrect').addClass('show-feedback');
        }
      } else {
        //NOTIFY POPUP FEEDBACK
        if(correct) {
          this.setupCorrectFeedback();
        } else {
          this.setupIncorrectFeedback();
        }
        this.$('.js-dragdrop-showfeedback-click').addClass('is-visible');
      }

      this.$('.js-dragdrop-check-click').addClass('is-selected');
      this.setCompletionStatus();
    },

    setItemVisited: function(_draggable) {
      this.$(_draggable).addClass('is-dropped');
      this.checkAllItemsCompleted();
    },

    checkAllItemsCompleted: function() {
      var complete = false;
      if(this.$('.js-drag-item').length === this.$('.is-dropped').length){
        complete = true;
      }
      if(complete) {
        this.$('.dragdrop__buttons').addClass('is-visible');
      }
    },

    getFeedbackTitle() {
      return this.model.get('_feedback').title || this.model.get('displayTitle') || this.model.get('title') || '';
    },

    setupCorrectFeedback() {
      Adapt.trigger('notify:popup', {
        title: this.getFeedbackTitle(),
        body: this.model.get('_feedback').correct
      });
    },

    setupIncorrectFeedback() {
      Adapt.trigger('notify:popup', {
        title: this.getFeedbackTitle(),
        body: this.model.get('_feedback').incorrect
      });
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
