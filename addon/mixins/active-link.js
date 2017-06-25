import Ember from 'ember';

// these are not currently editable in Ember
const transitioningInClass = 'ember-transitioning-in';
const transitioningOutClass = 'ember-transitioning-out';

export default Ember.Mixin.create({

  classNameBindings: ['_active', '_disabled', '_transitioningIn', '_transitioningOut'],
  linkSelector: 'a.ember-view',
  childLinkViews: [],

  init() {
    this._super(...arguments);
  },

  buildChildLinkViews: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      let childLinkSelector = this.get('linkSelector');
      let childLinkElements = this.$(childLinkSelector);
      let viewRegistry = Ember.getOwner(this).lookup('-view-registry:main');

      let childLinkViews = childLinkElements.toArray().map(
        view => viewRegistry[view.id]
      );

      this.set('childLinkViews', Ember.A(childLinkViews));
    });
  }),
  _transitioningInObserver: Ember.observer('childLinkViews.@each.transitioningIn', function() {
    Ember.run.debounce(this, this._transitioningInFunc, 16);
  }),
  _transitioningInFunc: function() {
    if (this.get('childLinkViews').isAny('transitioningIn')) {
      this.set("_transitioningIn", transitioningInClass);
    }
  },
  _transitioningOutObserver: Ember.observer('childLinkViews.@each.transitioningOut', function() {
    Ember.run.debounce(this, this._transitioningOutFunc, 16);
  }),
  _transitioningOutFunc: function() {
    if (this.get('childLinkViews').isAny('transitioningOut')) {
      this.set("_transitioningOut", transitioningOutClass);
    }
  },

  hasActiveLinks: Ember.computed('childLinkViews.@each.active', function() {
    return this.get('childLinkViews').isAny('active');
  }),

  activeClass: Ember.computed('childLinkViews.@each.active', function() {
    let activeLink = this.get('childLinkViews').findBy('active');
    return (activeLink ? activeLink.get('active') : 'active');
  }),

  _activeObserver: Ember.observer('hasActiveLinks', 'activeClass', function() {
    Ember.run.debounce(this, this._activeFunc, 16);
  }),
  _activeFunc: function() {
    this.set("_active", (this.get('hasActiveLinks') ? this.get('activeClass') : false));
  },

  allLinksDisabled: Ember.computed('childLinkViews.@each.disabled', function() {
    return !Ember.isEmpty(this.get('childLinkViews')) && this.get('childLinkViews').isEvery('disabled');
  }),

  disabledClass: Ember.computed('childLinkViews.@each.disabled', function() {
    let disabledLink = this.get('childLinkViews').findBy('disabled');
    return (disabledLink ? disabledLink.get('disabled') : 'disabled');
  }),
  _disabledObserver: Ember.observer('allLinksDisabled', 'disabledClass', function() {
    Ember.run.debounce(this, this._disabledFunc, 16);
  }),
  _disabledFunc: function() {
    this.set("_disabled", (this.get('allLinksDisabled') ? this.get('disabledClass') : false));
  },

});
