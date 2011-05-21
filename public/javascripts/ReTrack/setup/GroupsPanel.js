Ext.ns('ReTrack');

ReTrack.GroupsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var config = {
      title: 'Groups',
      html: 'groups panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.GroupsPanel.superclass.initComponent.apply(this, arguments);
  }
});
