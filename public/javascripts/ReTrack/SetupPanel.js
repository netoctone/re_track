Ext.ns('ReTrack');

ReTrack.SetupPanel = Ext.extend(Ext.TabPanel, {
  initComponent: function() {
    var config = {
      activeItem: 0,
      items: [
        new ReTrack.ProfilePanel(),
        new ReTrack.AccountsPanel(),
        new ReTrack.GroupsPanel(),
        new ReTrack.ReportAccountsPanel()
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.SetupPanel.superclass.initComponent.apply(this, arguments);
  }
});
