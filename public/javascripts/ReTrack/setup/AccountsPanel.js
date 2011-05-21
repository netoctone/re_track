Ext.ns('ReTrack');

ReTrack.AccountsPanel = Ext.extend(Ext.FormPanel, {
  initComponent: function() {
    var config = {
      title: 'Accounts',
      html: 'accounts panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.AccountsPanel.superclass.initComponent.apply(this, arguments);
  }
});
