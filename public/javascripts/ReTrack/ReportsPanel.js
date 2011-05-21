Ext.ns('ReTrack');

ReTrack.ReportsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var config = {
      title: 'Reports',
      html: 'reports panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.ReportsPanel.superclass.initComponent.apply(this, arguments);
  }
});
