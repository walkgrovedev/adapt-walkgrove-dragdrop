define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel',
  './dropdown'
], function(Adapt, ComponentView, ComponentModel, DropDown) {

  var DragdropView = ComponentView.extend({

    events: {
      'dragstart .js-drag-item': 'drag',
      'drop .js-drag-target': 'drop',
      'dragover .js-drag-target': 'allowDrop',
      'click .js-dragdrop-check-click': 'onCheckClicked',
      'click .js-dragdrop-showfeedback-click': 'onCheckClicked',
      'click .js-dragdrop-reset-click': 'onResetClicked'
    },

    _draggable: null,
    _isSubmitted: false,
    _attemptsMade: 0,

    preRender: function() {
      this._isSubmitted = false;
      this._attemptsMade = 0;
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();


      if(this.model.get('_placeholder_position') === "row") {
        
        this.$('.dragdrop__placeholder').width("" + 95/this.model.get('_placeholders').length + "%");
        this.$('.dragdrop__placeholder').attr('style','max-width:'  + 95/this.model.get('_placeholders').length + '%'); 
        this.$('.dragdrop__placeholder').attr('style','width:'  + 95/this.model.get('_placeholders').length + '%');
        const itemDimensions = this.model.get('_itemDimensions');
        const stacked = this.model.get('_items').length/this.model.get('_placeholders').length;
        let heightVar = itemDimensions._height;
        heightVar = Number(heightVar.replace('px',''));
        // console.log(stacked, heightVar);
        this.$('.dragdrop__placeholder-items').attr('style','min-height:'  + ( stacked * heightVar) + 'px');// .height("" +  stacked * heightVar + "");
      
      } 

      if(this.model.get('_position') === "column") {
        
        this.$('.dragdrop__item').attr('style','max-width:'  + 95/this.model.get('_items').length + '%');
        this.$('.dragdrop__item').attr('style','width:'  + 95/this.model.get('_items').length + '%');
      } 


      if (screen.width <= '1024') {
        this.$('.dragdrop__main').attr('style','display:none');
        this.$('.dragdrop__main-mobile').attr('style','display:block');

        this.$('.dragdrop__body-inner').html(this.model.get('mobileText'));
        this.$('.dragdrop__instruction-inner').html(this.model.get('mobileInstructions'));
        this.setUpDropdowns();

        this.$('.js-dragdrop-reset-click').addClass('is-hidden');
      } else {
        //randomise drag items
        var answers = this.$(".dragdrop__item");
        for(var i = 0; i < answers.length; i++){
            var target = Math.floor(Math.random() * answers.length -1) + 1;
            var target2 = Math.floor(Math.random() * answers.length -1) +1;
            answers.eq(target).before(answers.eq(target2));
        }
      }

    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this._isSubmitted = false;
        this._attemptsMade = 0;
        this.model.reset(isResetOnRevisit);

        this.model.set({
          _isEnabled: true,
          _isComplete: false,
          _isInteractionComplete: false
        });
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
        this.$(draggable).attr('style','max-width:100%');
        ev.target.appendChild(draggable);
        this.setItemVisited(draggable);

        var placeholderIndex = this.$(ev.target).data('placeholder') + 1;
        draggable.setAttribute('data-placeholder', placeholderIndex);
        
      }
    },

    onResetClicked: function() {

      this.model.get('_items').forEach((item, index) => {
        const thisID = this.model.get('_id');
        const draggable = document.getElementById('drag-item-' + thisID + '-' + index);
        // reset the placeholder the draggable is joined to ...
        draggable.setAttribute('data-placeholder', null);
        // reset to parent
        const container = document.getElementById('dragdrop-items-' + thisID + '');
        container.appendChild(draggable); 
      });

      //reset size
      if(this.model.get('_position') === "column") {
        this.$('.dragdrop__item').attr('style','max-width:'  + 95/this.model.get('_items').length + '%');
        this.$('.dragdrop__item').attr('style','width:'  + 95/this.model.get('_items').length + '%');
      } 
      this.$('.js-drag-item').removeClass('is-dropped');

      this.$('.js-dragdrop-check-click').addClass('is-hidden');

    },

    onCheckClicked: function() {

      let correct = true;

     if(this._attemptsMade !== Number(this.model.get('_feedback')._attempts)) {
       this._attemptsMade++;
     }

     if (screen.width <= '1024') {
        
        this.model.get('_items').forEach((item, index) => {

          let correctAnswer = "";
          item._options.forEach(function(option, i) {
            if(option._isCorrect === true) {
              correctAnswer = option.text;
            }
          });
          
          const compID = this.model.get('_id');
          let answer = "";
          this.$('.matching__select-container').each(function(i, el) {
            if(i === index) {
              answer = $(el).find('.js-dropdown-inner-' + compID + '').html();
            }
            
          });

          console.log(answer, correctAnswer);
          if(answer !== correctAnswer) {
            correct = false;
          }

        });

        if(this._attemptsMade === Number(this.model.get('_feedback')._attempts) || correct === true) {
          this.disableQuestion();
        }

      } else {

        this.model.get('_items').forEach((item, index) => {
          // console.log('drag-item-' + index);
          const thisID = this.model.get('_id');
          const draggable = document.getElementById('drag-item-' + thisID + '-' + index);
          // console.log(draggable);
          let draggable_place = draggable.getAttribute('data-draggable');
          let draggable_placeholder = draggable.getAttribute('data-placeholder');
          // console.log(draggable_place, draggable_placeholder);
          if(draggable_place !== draggable_placeholder) {
            correct = false;
          }
          
        });

      }

      const feedbackInline = this.model.get('_feedbackInline');

      if(!this.model.get('_assessment')){
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

            //audio?
            if (Adapt.config.get('_sound')._isActive === true) {
              if ( this.model.get('_feedback')._audio) {
                Adapt.trigger('audio:partial', {src: this.model.get('_feedback')._audio._src});
              }
            }

          } else {
            if(this._attemptsMade === Number(this.model.get('_feedback')._attempts)) {
              this.$('.dragdrop__feedback-incorrect').addClass('show-feedback');
            } else {
              this.$('.dragdrop__feedback-incorrect_final').addClass('show-feedback');

              //audio?
              if (Adapt.config.get('_sound')._isActive === true) {
                if ( this.model.get('_feedback')._audio_incorrect) {
                  Adapt.trigger('audio:partial', {src: this.model.get('_feedback')._audio_incorrect._src});
                }
              }
            }
          }
        } else {
          //NOTIFY POPUP FEEDBACK
          if(correct) {
            this.setupCorrectFeedback();
            
              //audio?
              if (Adapt.config.get('_sound')._isActive === true) {
                if ( this.model.get('_feedback')._audio) {
                  Adapt.trigger('audio:partial', {src: this.model.get('_feedback')._audio._src});
                }
              }
          } else {
          // console.log(this._attemptsMade, Number(this.model.get('_feedback')._attempts));
            if(this._attemptsMade === Number(this.model.get('_feedback')._attempts)) {
              this.setupIncorrectFinalFeedback();

              
              //audio?
              if (Adapt.config.get('_sound')._isActive === true) {
                if ( this.model.get('_feedback')._audio_incorrect) {
                  Adapt.trigger('audio:partial', {src: this.model.get('_feedback')._audio_incorrect._src});
                }
              }
            }else {
              this.setupIncorrectFeedback();
            }
          }
          if(this._attemptsMade === Number(this.model.get('_feedback')._attempts) || correct) {
            this.$('.js-dragdrop-showfeedback-click').addClass('is-visible');
            this.$('.js-dragdrop-reset-click').addClass('is-hidden');
            this.$('.js-dragdrop-check-click').addClass('is-hidden');
            this._isSubmitted = true;
          }
        }

        if(this._attemptsMade === Number(this.model.get('_feedback')._attempts) || correct) {
          this.$('.js-dragdrop-reset-click').addClass('is-hidden');
          this.$('.js-dragdrop-check-click').addClass('is-selected');
          this.setCompletionStatus();
        }

      } else {

        this.setCompletionStatus();

        const screenId = this.model.get('_id');

        if(correct) {
          Adapt.findById(screenId).set('_score', 1);
          //console.log(Adapt.findById(screenId).get('_score'));
        } else {
          Adapt.findById(screenId).set('_score', 0);
          //console.log(Adapt.findById(screenId).get('_score'));
        }

        this.$('.dragdrop__buttons').removeClass('is-visible');

      }

    
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
        this.$('.js-dragdrop-check-click').removeClass('is-hidden');
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

    setupIncorrectFinalFeedback() {
      Adapt.trigger('notify:popup', {
        title: this.getFeedbackTitle(),
        body: this.model.get('_feedback').incorrect_final
      });
    },

    dropdowns: null,


    setUpDropdowns: function() {
      _.bindAll(this, 'onOptionSelected');
      this.dropdowns = [];
      this.$('.matching__item').each(function(i, el) {
        var value = i;
        var dropdown = new DropDown({
          el: $(el).find('.dropdown')[0],
          placeholder: this.model.get('placeholder'),
          value: value
        });
        this.dropdowns.push(dropdown);
        dropdown.on('change', this.onOptionSelected);
      }.bind(this));
    },

    onOptionSelected: function(dropdown) {

      if (this._isSubmitted === true) return;
      var $container = dropdown.$el.parents('.matching__select-container');
      $container.removeClass('error');
      if (dropdown.isEmpty()) return;

      $container.addClass('is-selected');

      var complete = false;
      if(this.$('.matching__select-container').length === this.$('.is-selected').length){
        complete = true;
      }
      if(complete) {
        this.$('.js-dragdrop-check-click').removeClass('is-hidden');

        const divName = "#dragdrop__buttons";
        const element = document.querySelector(divName);
        // scroll to element
        setTimeout(function(){
          //element.scrollIntoView(false);
         }, 100);
      }
    },

    disableQuestion: function() {
      this.dropdowns.forEach(function(dropdown) {
        dropdown.toggleDisabled(true);
      });
    },

    enableQuestion: function() {
      this.dropdowns.forEach(function(dropdown) {
        dropdown.toggleDisabled(false);
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
