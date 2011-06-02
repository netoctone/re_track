Ext.ns('ReTrack');

ReTrack.SetupPanel = Ext.extend(ReTrack.ReShowTabPanel, {
  initComponent: function() {
    var config = {
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
