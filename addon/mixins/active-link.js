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

  _transitioningIn: Ember.computed.debounce('childLinkViews.@each.transitioningIn', function() {
    if (this.get('childLinkViews').isAny('transitioningIn')) {
      return transitioningInClass;
    }
  }, 16),

  _transitioningOut: Ember.computed.debounce('childLinkViews.@each.transitioningOut', function() {
    if (this.get('childLinkViews').isAny('transitioningOut')) {
      return transitioningOutClass;
    }
  }, 16),

  hasActiveLinks: Ember.computed('childLinkViews.@each.active', function() {
    return this.get('childLinkViews').isAny('active');
  }),

  activeClass: Ember.computed('childLinkViews.@each.active', function() {
    let activeLink = this.get('childLinkViews').findBy('active');
    return (activeLink ? activeLink.get('active') : 'active');
  }),

  _active: Ember.compute.debounce('hasActiveLinks', 'activeClass', function() {
    return (this.get('hasActiveLinks') ? this.get('activeClass') : false);
  }, 16),

  allLinksDisabled: Ember.computed('childLinkViews.@each.disabled', function() {
    return !Ember.isEmpty(this.get('childLinkViews')) && this.get('childLinkViews').isEvery('disabled');
  }),

  disabledClass: Ember.computed('childLinkViews.@each.disabled', function() {
    let disabledLink = this.get('childLinkViews').findBy('disabled');
    return (disabledLink ? disabledLink.get('disabled') : 'disabled');
  }),

  _disabled: Ember.computed.debounce('allLinksDisabled', 'disabledClass', function() {
    return (this.get('allLinksDisabled') ? this.get('disabledClass') : false);
  }, 16)

});
