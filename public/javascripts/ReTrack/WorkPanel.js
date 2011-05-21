Ext.ns('ReTrack');

ReTrack.WorkPanel = Ext.extend(Ext.TabPanel, {
  initComponent: function() {
    var config = {
      activeTab: 0,
      items: [
        new ReTrack.BugsPanel(),
        new ReTrack.ReportsPanel()
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.WorkPanel.superclass.initComponent.apply(this, arguments);
  }
});
