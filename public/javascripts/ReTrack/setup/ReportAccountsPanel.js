Ext.ns('ReTrack');

ReTrack.ReportAccountsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var config = {
      title: 'Report Accounts',
      html: 'report accounts panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.ReportAccountsPanel.superclass.initComponent.apply(this, arguments);
  }
});
