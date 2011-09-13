Ext.ns('ReTrack');

ReTrack.WorkPanel = Ext.extend(ReTrack.ReShowTabPanel, {
  initComponent: function() {
    var config = {
      items: [
        new ReTrack.BugsPanel(),
        new ReTrack.ReportsPanel()
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.WorkPanel.superclass.initComponent.apply(this, arguments);
  }
});
