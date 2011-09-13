Ext.ns('ReTrack');

ReTrack.ReShowTabPanel = Ext.extend(Ext.TabPanel, {
  initComponent: function() {
    ReTrack.ReShowTabPanel.superclass.initComponent.apply(this, arguments);
    this.setActiveTab(0);
  },

  constructor: function(config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      afterrender: function(comp) {
        comp.on({
          show: function(comp) {
            comp.getActiveTab().show();
          }
        });
      }
    });

    ReTrack.ReShowTabPanel.superclass.constructor.call(this, config);
  }
});
