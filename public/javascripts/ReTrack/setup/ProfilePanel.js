Ext.ns('ReTrack');

ReTrack.ProfilePanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var config = {
      title: 'Profile',
      html: 'profile panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.ProfilePanel.superclass.initComponent.apply(this, arguments);
  }
});
